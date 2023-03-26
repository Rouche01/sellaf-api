import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  ChargeType,
  Currency,
  PaymentProcessor,
  TransactionStatus,
} from '@prisma/client';
import { AppLoggerService } from 'src/app_logger';
import { applicationConfig } from 'src/config';
import { subscriptionPlanConfig } from 'src/constants';
import { FlutterwaveService } from 'src/flutterwave';
import { DeleteBeneficiariesResponse } from 'src/interfaces';
import { PrismaService } from 'src/prisma';
import { getDifferenceInSecondsTillNow } from 'src/utils';
import { SECONDS_IN_A_DAY } from '../constants';
import { generateTransactionRef } from '../utils';
import { BaseStrategy } from './base_strategy.strategy';
import {
  AddTransferBeneficiariesArgs,
  AddTransferBeneficiariesResponse,
  DeleteTransferBeneficiariesArgs,
  FetchBanksArgs,
  FetchBanksResponse,
  InitiatePaymentArgs,
  InitiatePaymentResponse,
  PaymentStrategyInterface,
  ResolveAccountNumberArgs,
  ResolveAccountNumberResponse,
  UseWebhookArgs,
} from './interfaces';

@Injectable()
export class FlutterwaveStrategy
  extends BaseStrategy
  implements PaymentStrategyInterface
{
  private readonly logger = new AppLoggerService(FlutterwaveStrategy.name);

  constructor(
    protected readonly prismaService: PrismaService,
    private readonly flutterwaveService: FlutterwaveService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
  ) {
    super(prismaService);
  }

  async initiatePayment(
    args: InitiatePaymentArgs,
  ): Promise<InitiatePaymentResponse> {
    const { amount, paymentMeta, transactionType, user, subscriptionPlan } =
      args;
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
      redirect_url: `${this.appConfig.frontendUrl}/overview`,
      customer: {
        email: user.email,
        name: `${user.firstName} ${user.family_name}`,
      },
      meta: paymentMeta,
      payment_options: 'card, account, banktransfer, mpesa',
      ...(subscriptionPlan && {
        // revert from test
        payment_plan:
          subscriptionPlanConfig[subscriptionPlan].flutterwavePlanId,
      }),
    };

    const paymentRedirectRes =
      await this.flutterwaveService.payWithStandardFlow(payload);

    // create a new transaction here not tied to any subscription
    const transaction = await this.createNewTransaction({
      amount: +amount,
      chargeType: 'DEBIT',
      initiatedBy: user.id,
      referenceCode: transactionRef,
      type: transactionType,
      referredBy: referredById,
      paymentProcessorType: PaymentProcessor.FLUTTERWAVE,
    });

    return { transactionId: transaction.id, ...paymentRedirectRes };
  }

  async getBankList(args: FetchBanksArgs): Promise<FetchBanksResponse> {
    const { country } = args;
    return this.flutterwaveService.getBanks(country);
  }

  async resolveBankAccountNumber(
    args: ResolveAccountNumberArgs,
  ): Promise<ResolveAccountNumberResponse> {
    const { accountNumber, bankCode } = args;
    return this.flutterwaveService.resolveBankAccount(accountNumber, bankCode);
  }

  async addTransferBeneficiaries(
    args: AddTransferBeneficiariesArgs,
  ): Promise<AddTransferBeneficiariesResponse> {
    const { accountNumber, bankCode, beneficiaryName } = args;
    return this.flutterwaveService.addTransferBeneficiaries(
      bankCode,
      accountNumber,
      beneficiaryName,
    );
  }

  async deleteTransferBeneficiaries(
    args: DeleteTransferBeneficiariesArgs,
  ): Promise<DeleteBeneficiariesResponse> {
    const { beneficiaryId } = args;
    return this.flutterwaveService.deleteTransferBeneficiaries(beneficiaryId);
  }

  async useWebhook(args: UseWebhookArgs): Promise<void> {
    const {
      webhookDto,
      webhookSignature,
      onSuccessfulPayment,
      onFailedPayment,
    } = args;

    if (
      !webhookSignature ||
      webhookSignature !== this.appConfig.flutterwave.webhookSecretHash
    ) {
      throw new ForbiddenException();
    }

    this.logger.log(webhookDto.event);

    const transaction = await this.prismaService.transaction.findMany({
      where: { referenceCode: webhookDto.data.tx_ref },
      include: { subscription: true },
      take: -1,
    });

    const immediatePreviousTransaction = transaction[0];
    const timeDifferenceFromLastTrx = getDifferenceInSecondsTillNow(
      immediatePreviousTransaction.createdAt,
    );

    console.log(immediatePreviousTransaction, timeDifferenceFromLastTrx);
    if (webhookDto.event === 'charge.completed') {
      this.logger.log(
        `Charge completed webhook event received for ${webhookDto.data.tx_ref} transaction`,
      );

      if (webhookDto.data.status.toLocaleLowerCase() === 'successful') {
        onSuccessfulPayment({
          isNewTransaction: timeDifferenceFromLastTrx > SECONDS_IN_A_DAY,
          lastTransaction: immediatePreviousTransaction,
          newTransactionPayload: {
            amount: webhookDto.data.amount,
            chargeType: ChargeType.DEBIT,
            initiatedBy: immediatePreviousTransaction.initiatedBy,
            referenceCode: webhookDto.data.tx_ref,
            type: immediatePreviousTransaction.type,
            referredBy: immediatePreviousTransaction.referredBy,
            paymentProcessorType: PaymentProcessor.FLUTTERWAVE,
            status: TransactionStatus.success,
          },
          processorTrxId: webhookDto.data.id,
        });
      }

      if (webhookDto.data.status.toLocaleLowerCase() === 'failed') {
        onFailedPayment({
          lastTransaction: immediatePreviousTransaction,
          processorTrxId: webhookDto.data.id,
        });
      }
    }

    if (webhookDto.event === 'subscription.cancelled') {
      console.log(webhookDto.event);

      const customerEmail = webhookDto.data.customer.email;

      const customer = await this.prismaService.user.findUnique({
        where: { email: customerEmail },
        include: { affiliate: true },
      });

      if (customer.affiliate) {
        await this.prismaService.subscription.update({
          where: { affiliateId: customer.affiliate.id },
          data: { willRenew: false },
        });
      }
    }
  }
}
