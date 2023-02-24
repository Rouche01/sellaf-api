import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Currency,
  SubscriptionPlan,
  Transaction,
  TransactionStatus,
  TransactionType,
  Subscription,
} from '@prisma/client';
import { generateTransactionRef } from 'src/account/utils';
import { AppLoggerService } from 'src/app_logger';
import { subscriptionPlanConfig } from 'src/constants';
import { FlutterwaveService } from 'src/flutterwave';
import { FlwPaymentSubscription } from 'src/flutterwave/interfaces';
import { AuthenticatedUser, Country, FlwBank } from 'src/interfaces';
import { PrismaService } from 'src/prisma';
import {
  AddBankDto,
  AddBankQueryDto,
  ConfirmBankAccountDto,
  VerifyTransactionQueryDto,
  WebhookDto,
} from '../dtos';
import { CreateNewTransactionPayload } from '../interfaces';

type TransactionWithSubscription = Transaction & {
  subscription: Subscription;
};

@Injectable()
export class PaymentService {
  private readonly logger = new AppLoggerService(PaymentService.name);
  constructor(
    private readonly flutterwaveService: FlutterwaveService,
    private readonly prismaService: PrismaService,
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
    const { bankCode, accountNumber, beneficiaryName } = dto;
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
    };

    try {
      if (applyTo === 'store') {
        const store = await this.prismaService.store.findFirst({
          where: { id, owner: { id: user.sellerId } },
        });

        if (!store) {
          throw new NotFoundException('Store does not exist');
        }

        await this.prismaService.store.update({
          where: { id },
          data: bankUpdateData,
        });
      }

      if (applyTo === 'affiliate') {
        const affiliate = await this.prismaService.affiliate.findFirst({
          where: { id, user: { id: user.id } },
        });

        if (!affiliate) {
          throw new NotFoundException('Affiliate does not exist');
        }

        await this.prismaService.affiliate.update({
          where: { id },
          data: bankUpdateData,
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

  async payWithFlutterwave(
    user: AuthenticatedUser,
    paymentMeta: Record<string, any>,
    amount: string,
    transactionType: TransactionType,
    subscriptionPlan?: SubscriptionPlan,
  ) {
    const transactionRef = generateTransactionRef();

    let referredById: number;

    if (transactionType === 'SUBSCRIPTION') {
      const affiliateUser = await this.prismaService.affiliate.findUnique({
        where: { id: user.affiliateId },
      });
      referredById = affiliateUser.referredBy;
    }

    const payload = {
      tx_ref: transactionRef,
      amount,
      currency: Currency.NGN,
      redirect_url: 'http://localhost:3000/overview',
      customer: {
        email: user.email,
        name: `${user.firstName} ${user.family_name}`,
      },
      meta: paymentMeta,
      payment_options: 'card, account, banktransfer, mpesa',
      ...(subscriptionPlan && {
        payment_plan:
          subscriptionPlanConfig[subscriptionPlan].flutterwavePlanId,
      }),
    };

    const paymentRedirectRes =
      await this.flutterwaveService.payWithStandardFlow(payload);

    const transaction = await this.createNewTransaction({
      amount: +amount,
      chargeType: 'DEBIT',
      initiatedBy: user.id,
      referenceCode: transactionRef,
      type: transactionType,
      referredBy: referredById,
      paymentProcessorType: 'FLUTTERWAVE',
    });

    return { transactionId: transaction.id, ...paymentRedirectRes };
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
        await this.activateSubscription(transaction);
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
        await this.activateSubscription(transaction);
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

  async useWebhook(dto: WebhookDto) {
    const transaction = await this.prismaService.transaction.findFirst({
      where: { referenceCode: dto.data.tx_ref },
      include: { subscription: true },
    });
    if (dto.event === 'charge.completed') {
      console.log(dto);
      this.logger.log(
        `Charge completed webhook event received for ${dto.data.tx_ref} transaction`,
      );

      if (dto.data.status.toLocaleLowerCase() === 'successful') {
        await this.updateTransactionStatus(transaction, 'success', dto.data.id);
        await this.activateSubscription(transaction);
        this.logger.log(`Payment was successful`);
      }

      if (dto.data.status.toLocaleLowerCase() === 'failed') {
        await this.updateTransactionStatus(transaction, 'failed', dto.data.id);
        this.logger.log(`Payment failed`);
      }
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

  private async createNewTransaction(payload: CreateNewTransactionPayload) {
    const transaction = await this.prismaService.transaction.create({
      data: {
        amount: payload.amount,
        chargeType: payload.chargeType,
        referenceCode: payload.referenceCode,
        type: payload.type,
        address: payload.address,
        initiatedBy: payload.initiatedBy,
        referredBy: payload.referredBy,
        paymentProcessorRef: {
          create: {
            type: payload.paymentProcessorType,
          },
        },
      },
    });

    return transaction;
  }

  private async updateTransactionStatus(
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

  private async activateSubscription(transaction: TransactionWithSubscription) {
    if (transaction.subscription && !transaction.subscription.active) {
      await this.prismaService.subscription.update({
        where: { id: transaction.subscription.id },
        data: { active: true, willRenew: true },
      });
    }
  }
}
