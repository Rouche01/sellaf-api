import { InjectQueue } from '@nestjs/bullmq';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Currency, PaymentProcessor, TransactionStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { AppLoggerService } from 'src/app_logger';
import { CoinbaseService } from 'src/coinbase';
import { applicationConfig } from 'src/config';
import { TERMINATE_SUBSCRIPTION_QUEUE } from 'src/constants';
import { PrismaService } from 'src/prisma';
import {
  TerminateSubscriptionJobData,
  QueueManagerService,
} from 'src/queue_manager';
import { getDifferenceInMsFromNow } from 'src/utils';
import { generateTransactionRef } from '../utils';
import { BaseStrategy } from './base_strategy.strategy';
import {
  InitiatePaymentArgs,
  InitiatePaymentResponse,
  PaymentStrategyInterface,
  UseWebhookArgs,
} from './interfaces';

@Injectable()
export class CoinbaseStrategy
  extends BaseStrategy
  implements PaymentStrategyInterface
{
  private readonly logger = new AppLoggerService(CoinbaseStrategy.name);
  constructor(
    private readonly coinbaseService: CoinbaseService,
    protected readonly prismaService: PrismaService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
    @InjectQueue(TERMINATE_SUBSCRIPTION_QUEUE)
    private readonly terminateSubQueue: Queue<TerminateSubscriptionJobData>,
    private readonly queueManagerService: QueueManagerService,
  ) {
    super(prismaService);
  }
  async initiatePayment(
    args: InitiatePaymentArgs,
  ): Promise<InitiatePaymentResponse> {
    const { amount, description, transactionType, user, paymentMeta } = args;
    const transactionRef = generateTransactionRef();
    const { paymentLink, status } = await this.coinbaseService.createCharge({
      // hardcoding this just for testing
      amount: '500',
      currency: Currency.NGN,
      description,
      name: 'Sellaf Africa',
      referenceCode: transactionRef,
      paymentMetadata: paymentMeta,
    });

    let referredById: number;

    if (transactionType === 'SUBSCRIPTION') {
      const affiliateUser = await this.prismaService.affiliate.findUnique({
        where: { id: user.affiliateId },
      });
      referredById = affiliateUser.referredBy;
    }

    const transaction = await this.createNewTransaction({
      amount: +amount,
      chargeType: 'DEBIT',
      initiatedBy: user.id,
      referenceCode: transactionRef,
      type: transactionType,
      referredBy: referredById,
      paymentProcessorType: PaymentProcessor.COINBASE,
    });

    return {
      paymentLink,
      status,
      transactionId: transaction.id,
    };
  }

  async useWebhook(args: UseWebhookArgs): Promise<void> {
    const { webhookSignature, rawBody, webhookDto } = args;
    const isLegit = this.coinbaseService.verifySignatureHeader(
      rawBody,
      webhookSignature,
      this.appConfig.coinbase.webhookSecretHash,
    );
    if (!webhookSignature || !isLegit) {
      throw new ForbiddenException();
    }
    console.log('coinbase webhook');
    if (typeof webhookDto.event === 'object') {
      const transactionReference = webhookDto.event.data.metadata.trx_ref;

      if (webhookDto.event.type === 'charge:created') {
        this.logger.log(
          `Charge created webhook event received for ${transactionReference} transaction`,
        );
        this._onChargeCreatedEvent(
          transactionReference,
          webhookDto.event.data.id,
        );
      }

      if (webhookDto.event.type === 'charge:pending') {
        this.logger.log(
          `Charge pending webhook event received for ${transactionReference} transaction`,
        );
        console.log(webhookDto.event.type);
        this._onPendingPaymentEvent(transactionReference);
      }

      if (webhookDto.event.type === 'charge:confirmed') {
        const userEmail = webhookDto.event.data.metadata.emailAddress;
        this.logger.log(
          `Charge confirmed and successful webhook event received for ${transactionReference} transaction`,
        );
      }
    }
    return;
  }

  private async _onChargeCreatedEvent(referenceCode: string, chargeId: string) {
    const transaction = await this.prismaService.transaction.findFirst({
      where: { referenceCode },
    });

    await this.prismaService.transaction.update({
      where: { id: transaction.id },
      data: {
        paymentProcessorRef: { update: { trxId: chargeId, referenceCode } },
      },
    });
  }

  private async _onPendingPaymentEvent(referenceCode: string) {
    const transaction = await this.prismaService.transaction.findFirst({
      where: { referenceCode },
    });

    await this.prismaService.transaction.update({
      where: { id: transaction.id },
      data: { status: TransactionStatus.pending },
    });
  }

  private async _onSuccessfulPaymentEvent(
    referenceCode: string,
    userEmail: string,
  ) {
    const transaction = await this.prismaService.transaction.findFirst({
      where: { referenceCode },
      include: { subscription: true },
    });

    await this.prismaService.transaction.update({
      where: { id: transaction.id },
      data: { status: TransactionStatus.success },
    });

    // activate subscription if transaction is for a subscription payment
    if (transaction.subscription) {
      await this.activateSubscriptionForTransaction(transaction);

      // create a terminate subscription job to end subscription when
      // the subscription cycle ends and send an email to renew subscription
      // since coinbase does not provide functionality for recurring payment
      await this.queueManagerService.addJob<TerminateSubscriptionJobData>({
        data: {
          paymentProcessor: PaymentProcessor.COINBASE,
          userEmail,
          subscription: transaction.subscription,
        },
        jobDelay: getDifferenceInMsFromNow(transaction.subscription.endDate),
        jobId: transaction.subscriptionId.toString(),
        jobName: 'Terminate Subscription',
        queueName: 'TERMINATE_SUBSCRIPTION_QUEUE',
      });
    }
  }
}
