import { Injectable } from '@nestjs/common';
import { PaymentProcessor, Transaction } from '@prisma/client';
import add from 'date-fns/add';
import { AppLoggerService } from 'src/app_logger';
import { PrismaService } from 'src/prisma';
import { WebhookDto } from '../dtos';
import {
  OnFailedPaymentArgs,
  OnSuccessfulPaymentArgs,
  WebhookCustomHeaders,
} from '../interfaces';
import {
  CoinbaseStrategy,
  FlutterwaveStrategy,
  PaymentContext,
} from '../strategy';
import { PaymentService } from './payment.service';

@Injectable()
export class PaymentWebhookService {
  private readonly logger = new AppLoggerService(PaymentWebhookService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly paymentContext: PaymentContext,
    private readonly flutterwaveStrategy: FlutterwaveStrategy,
    private readonly coinbaseStrategy: CoinbaseStrategy,
  ) {}

  async useWebhook(
    dto: WebhookDto,
    paymentProcessor: PaymentProcessor,
    headers: WebhookCustomHeaders,
    rawBody: Buffer,
  ) {
    if (paymentProcessor === PaymentProcessor.COINBASE) {
      console.log(dto, headers);
      const webhookSignature = headers['x-cc-webhook-signature'];
      this.paymentContext.setStrategy(this.coinbaseStrategy);
      return this.paymentContext.useWebhook({
        onFailedPayment: this.onFailedPayment,
        onSuccessfulPayment: this.onSuccessfulPayment,
        webhookDto: dto,
        webhookSignature,
        rawBody,
      });
    }

    if (paymentProcessor === PaymentProcessor.FLUTTERWAVE) {
      const webhookSignature = headers['verif-hash'];
      this.paymentContext.setStrategy(this.flutterwaveStrategy);
      return this.paymentContext.useWebhook({
        onFailedPayment: this.onFailedPayment,
        onSuccessfulPayment: this.onSuccessfulPayment,
        webhookDto: dto,
        webhookSignature,
      });
    }
  }

  private async onSuccessfulPayment(args: OnSuccessfulPaymentArgs) {
    const {
      isNewTransaction,
      lastTransaction,
      newTransactionPayload,
      processorTrxId,
    } = args;

    if (lastTransaction.status !== 'success') {
      await this.paymentService.updateTransactionStatusAndProcessorTrxId(
        lastTransaction,
        'success',
        processorTrxId,
      );
      await this.paymentService.activateSubscriptionRelatedToTransaction(
        lastTransaction,
      );
      this.logger.log(`Payment was successful`);
    } else if (lastTransaction.status === 'success' && isNewTransaction) {
      const newTransaction = await this.paymentService.createNewTransaction(
        newTransactionPayload,
      );
      await this.renewSubscriptionRelatedToTransaction(
        lastTransaction,
        newTransaction,
      );
    }
  }

  private async onFailedPayment(args: OnFailedPaymentArgs) {
    const { lastTransaction, processorTrxId } = args;

    // only update the failure status of the last transaction
    // if it doesn't have a success status to prevent updating
    // failure status on subscription renewal charge failure
    // it will be handled in subscription cancel event

    if (lastTransaction.status !== 'success') {
      await this.paymentService.updateTransactionStatusAndProcessorTrxId(
        lastTransaction,
        'failed',
        processorTrxId,
      );
      this.logger.log(`Payment failed`);
    }
  }

  private async renewSubscriptionRelatedToTransaction(
    oldTransaction: Transaction,
    newTransaction: Transaction,
  ) {
    await this.prismaService.subscription.update({
      where: { id: oldTransaction.subscriptionId },
      data: {
        active: true,
        willRenew: true,
        activeTransactionId: newTransaction.id,
        startDate: new Date(),
        endDate: add(new Date(), { years: 1 }),
        transactions: {
          connect: {
            id: newTransaction.id,
          },
        },
      },
    });
  }
}
