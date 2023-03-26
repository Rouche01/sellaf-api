import { ConflictException, Injectable } from '@nestjs/common';
import {
  Transaction,
  TransactionStatus,
  PaymentProcessor,
} from '@prisma/client';
import { KeycloakUserService } from 'src/account';
import { AppLoggerService } from 'src/app_logger';
import { FlutterwaveService } from 'src/flutterwave';
import { FlwPaymentSubscription } from 'src/flutterwave/interfaces';
import { AuthenticatedUser, Country, FlwBank, ROLES } from 'src/interfaces';
import { PrismaService } from 'src/prisma';
import { checkUserRole } from 'src/utils';
import {
  AddBankDto,
  AddBankQueryDto,
  ConfirmBankAccountDto,
  DeleteBankDto,
  DeleteBankQueryDto,
  VerifyTransactionQueryDto,
} from '../dtos';
import {
  CreateNewTransactionPayload,
  HandlePaymentArgs,
  TransactionWithSubscription,
} from '../interfaces';
import {
  AddTransferBeneficiariesResponse,
  CoinbaseStrategy,
  FlutterwaveStrategy,
} from '../strategy';
import { PaymentContext } from '../strategy';

@Injectable()
export class PaymentService {
  private readonly logger = new AppLoggerService(PaymentService.name);
  constructor(
    private readonly flutterwaveService: FlutterwaveService,
    private readonly prismaService: PrismaService,
    private readonly flutterwaveStrategy: FlutterwaveStrategy,
    private readonly coinbaseStrategy: CoinbaseStrategy,
    private readonly paymentContext: PaymentContext,
    private readonly keycloakUserService: KeycloakUserService,
  ) {}

  async getBankList(
    country: Country = 'NG',
    paymentProcessor: PaymentProcessor,
  ): Promise<FlwBank[]> {
    if (paymentProcessor === PaymentProcessor.FLUTTERWAVE) {
      this.paymentContext.setStrategy(this.flutterwaveStrategy);
      return this.paymentContext.fetchBankList({ country });
    }
  }

  async confirmAccountNumber(
    dto: ConfirmBankAccountDto,
    paymentProcessor: PaymentProcessor,
  ) {
    if (paymentProcessor === PaymentProcessor.FLUTTERWAVE) {
      this.paymentContext.setStrategy(this.flutterwaveStrategy);
      return this.paymentContext.resolveBankAccountNumber({
        accountNumber: dto.accountNumber,
        bankCode: dto.bankCode,
      });
    }
  }

  async removeBankAccount(
    user: AuthenticatedUser,
    dto: DeleteBankDto,
    query: DeleteBankQueryDto,
    paymentProcessor: PaymentProcessor,
  ) {
    const { beneficiaryId, password } = dto;
    const { storeId } = query;

    await this.keycloakUserService.loginKeycloakUser(
      user.preferred_username,
      password,
    );

    if (paymentProcessor === PaymentProcessor.FLUTTERWAVE) {
      this.paymentContext.setStrategy(this.flutterwaveStrategy);
      await this.paymentContext.deleteTransferBeneficiaries({
        beneficiaryId,
      });
    }

    try {
      if (checkUserRole(ROLES['SELLER-ADMIN'], user)) {
        // TO-DO: Add bank information for a store owned by the seller
        console.log(storeId);
      }
      if (checkUserRole(ROLES.AFFILIATE, user)) {
        console.log('in affiliate');
        await this.prismaService.bank.delete({
          where: { affiliateId: user.affiliateId },
        });
      }
    } catch (err) {
      this.logger.error(err?.response?.data || err?.message);
      throw err;
    }
    return { status: 'success', message: 'Bank account information deleted.' };
  }

  async addBankAccount(
    dto: AddBankDto,
    query: AddBankQueryDto,
    user: AuthenticatedUser,
    paymentProcessor: PaymentProcessor,
  ): Promise<{ status: string; message: string }> {
    const { bankCode, accountNumber, beneficiaryName } = dto;
    const { storeId } = query;
    let beneficiaryResponse: AddTransferBeneficiariesResponse;

    if (paymentProcessor === PaymentProcessor.FLUTTERWAVE) {
      this.paymentContext.setStrategy(this.flutterwaveStrategy);
      beneficiaryResponse = await this.paymentContext.addTransferBeneficiaries({
        accountNumber,
        bankCode,
        beneficiaryName,
      });
    }

    const bankCreateData = {
      accountNumber: beneficiaryResponse.accountNumber,
      bankCode: beneficiaryResponse.bankCode,
      bankName: beneficiaryResponse.bankName,
      beneficiaryId: beneficiaryResponse.id,
      accountName: beneficiaryName,
    };

    try {
      if (checkUserRole(ROLES['SELLER-ADMIN'], user)) {
        // TO-DO: Add bank information for a store owned by the seller
        console.log(storeId);
      }
      if (checkUserRole(ROLES.AFFILIATE, user)) {
        await this.prismaService.bank.create({
          data: {
            ...bankCreateData,
            affiliateId: user.affiliateId,
          },
        });
      }

      return { status: 'success', message: 'Bank account added successfully' };
    } catch (err) {
      this.logger.error(err?.response?.data || err?.message);
      throw err;
    }
  }

  async handlePayment({
    initiatePaymentArgs,
    paymentProcessor,
  }: HandlePaymentArgs) {
    if (paymentProcessor === PaymentProcessor.FLUTTERWAVE) {
      this.paymentContext.setStrategy(this.flutterwaveStrategy);
      return this.paymentContext.makePayment(initiatePaymentArgs);
    }

    if (paymentProcessor === PaymentProcessor.COINBASE) {
      this.paymentContext.setStrategy(this.coinbaseStrategy);
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
        await this.updateTransactionStatusAndProcessorTrxId(
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
        await this.updateTransactionStatusAndProcessorTrxId(
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
      await this.updateTransactionStatusAndProcessorTrxId(
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

    this.logger.log(subscriptionByTrxId);

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

  async createNewTransaction(
    payload: CreateNewTransactionPayload,
    prismaService: PrismaService = this.prismaService,
  ) {
    const transaction = await prismaService.transaction.create({
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
        status: payload.status,
      },
    });

    return transaction;
  }

  async updateTransactionStatusAndProcessorTrxId(
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
}
