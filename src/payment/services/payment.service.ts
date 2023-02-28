import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Transaction, TransactionStatus, Subscription } from '@prisma/client';
import { AppLoggerService } from 'src/app_logger';
import { FlutterwaveService } from 'src/flutterwave';
import { FlwPaymentSubscription } from 'src/flutterwave/interfaces';
import { AuthenticatedUser, Country, FlwBank } from 'src/interfaces';
import { PrismaService } from 'src/prisma';
import {
  AddBankDto,
  AddBankQueryDto,
  ConfirmBankAccountDto,
  VerifyTransactionQueryDto,
} from '../dtos';
import {
  CreateBankDetailsPayload,
  CreateNewTransactionPayload,
  HandlePaymentArgs,
} from '../interfaces';
import { FlutterwaveStrategy } from '../strategy';
import { PaymentContext } from '../strategy';

type TransactionWithSubscription = Transaction & {
  subscription: Subscription;
};

@Injectable()
export class PaymentService {
  private readonly logger = new AppLoggerService(PaymentService.name);
  constructor(
    private readonly flutterwaveService: FlutterwaveService,
    private readonly prismaService: PrismaService,
    private readonly flutterwaveStrategy: FlutterwaveStrategy,
    private readonly paymentContext: PaymentContext,
  ) {}

  async getBankList(country: Country = 'NG'): Promise<FlwBank[]> {
    return this.flutterwaveService.getBanks(country);
  }

  async confirmAccountNumber(dto: ConfirmBankAccountDto) {
    return this.flutterwaveService.resolveBankAccount(
      dto.accountNumber,
      dto.bankCode,
    );
  }

  async addBankAccount(
    dto: AddBankDto,
    query: AddBankQueryDto,
    user: AuthenticatedUser,
  ): Promise<{ status: string; message: string }> {
    const { bankCode, accountNumber, beneficiaryName, accountName } = dto;
    const { applyTo, id } = query;
    const beneficiaryResp =
      await this.flutterwaveService.addTransferBeneficiaries(
        bankCode,
        accountNumber,
        beneficiaryName,
      );

    const bankUpdateData = {
      accountNumber: beneficiaryResp.accountNumber,
      bankCode: beneficiaryResp.bankCode,
      bankName: beneficiaryResp.bankName,
      beneficiaryId: beneficiaryResp.id,
      accountName,
    };

    try {
      if (applyTo === 'store') {
        const store = await this.prismaService.store.findFirst({
          where: { id, owner: { id: user.sellerId } },
        });

        if (!store) {
          throw new NotFoundException('Store does not exist');
        }

        await this.createBankDetails({ ...bankUpdateData, storeId: store.id });
      }

      if (applyTo === 'affiliate') {
        const affiliate = await this.prismaService.affiliate.findFirst({
          where: { id, user: { id: user.id } },
        });

        if (!affiliate) {
          throw new NotFoundException('Affiliate does not exist');
        }

        await this.createBankDetails({
          ...bankUpdateData,
          affiliateId: affiliate.id,
        });
      }

      return { status: 'success', message: 'Bank account added successfully' };
    } catch (err) {
      this.logger.error(err?.response?.data || err?.message);
      throw new InternalServerErrorException(
        err?.message || 'Something went wrong',
      );
    }
  }

  async handlePayment({
    initiatePaymentArgs,
    paymentProcessor,
  }: HandlePaymentArgs) {
    if (paymentProcessor === 'flutterwave') {
      this.paymentContext.setStrategy(this.flutterwaveStrategy);
      return this.paymentContext.makePayment(initiatePaymentArgs);
    }
  }

  async verifyTransaction(dto: VerifyTransactionQueryDto) {
    const { data } = await this.flutterwaveService.verifyTransaction(
      dto.transactionId,
    );

    const transaction = await this.prismaService.transaction.findFirst({
      where: { referenceCode: dto.transactionRef },
      include: { subscription: true },
    });

    if (data.status === 'successful') {
      if (
        data.amount === dto.expectedAmount &&
        data.currency === dto.transactionCurrency
      ) {
        await this.updateTransactionStatus(
          transaction,
          'success',
          dto.transactionId,
        );
        // activate subscription if this is a transaction payment
        await this.activateSubscriptionRelatedToTransaction(transaction);
        return {
          status: 'successful',
          message: 'Payment was successful',
        };
      } else {
        await this.updateTransactionStatus(
          transaction,
          'success',
          dto.transactionId,
        );
        await this.activateSubscriptionRelatedToTransaction(transaction);
        return {
          status: 'successful-with-clarification',
          message:
            'Payment was successful with some clarification needed, please reach out to our customer support',
        };
      }
    } else {
      await this.updateTransactionStatus(
        transaction,
        data.status as TransactionStatus,
        dto.transactionId,
      );
      return {
        status: data.status,
        message: `Payment is ${data.status}`,
      };
    }
  }

  async getPaymentSubscription(transactionId: string) {
    const subscriptionByTrxId =
      await this.flutterwaveService.getSubscriptionByTrxId(transactionId);

    if (subscriptionByTrxId.length === 0) {
      throw new ConflictException(
        'Transaction subscription not found in payment processor',
      );
    }

    return subscriptionByTrxId[0];
  }

  async cancelPaymentSubscription(paymentSubscription: FlwPaymentSubscription) {
    await this.flutterwaveService.deactivateActiveSubscription(
      paymentSubscription.id,
    );
  }

  async createNewTransaction(payload: CreateNewTransactionPayload) {
    const transaction = await this.prismaService.transaction.create({
      data: {
        amount: payload.amount,
        chargeType: payload.chargeType,
        referenceCode: payload.referenceCode,
        type: payload.type,
        address: payload.address,
        initiatedBy: payload.initiatedBy,
        referredBy: 2,
        paymentProcessorRef: {
          create: {
            type: payload.paymentProcessorType,
          },
        },
        status: payload.status,
      },
    });

    return transaction;
  }

  async updateTransactionStatus(
    transaction: Transaction,
    status: TransactionStatus,
    processorTrxId: string,
  ) {
    if (transaction.status !== status) {
      await this.prismaService.transaction.update({
        data: {
          status: status,
          paymentProcessorRef: { update: { trxId: processorTrxId.toString() } },
        },
        where: { id: transaction.id },
      });
    }
  }

  async activateSubscriptionRelatedToTransaction(
    transaction: TransactionWithSubscription,
  ) {
    if (transaction.subscription && !transaction.subscription.active) {
      await this.prismaService.subscription.update({
        where: { id: transaction.subscriptionId },
        data: { active: true, willRenew: true },
      });
    }
  }

  private async createBankDetails(
    bankDetailsPayload: CreateBankDetailsPayload,
  ) {
    await this.prismaService.bank.create({
      data: { ...bankDetailsPayload },
    });
  }
}
