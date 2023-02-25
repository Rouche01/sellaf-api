import { Injectable } from '@nestjs/common';
import { Transaction, TransactionStatus } from '@prisma/client';
import add from 'date-fns/add';
import { AppLoggerService } from 'src/app_logger';
import { PrismaService } from 'src/prisma';
import { getDifferenceInSecondsTillNow } from 'src/utils';
import { WebhookDto } from '../dtos';
import { PaymentService } from './payment.service';

const SECONDS_IN_A_DAY = 45 * 60;

@Injectable()
export class PaymentWebhookService {
  private readonly logger = new AppLoggerService(PaymentWebhookService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async useWebhook(dto: WebhookDto) {
    const transaction = await this.prismaService.transaction.findMany({
      where: { referenceCode: dto.data.tx_ref },
      include: { subscription: true },
      take: -1,
    });

    const lastTransaction = transaction[0];
    const timeDifferenceFromLastTrx = getDifferenceInSecondsTillNow(
      lastTransaction.createdAt,
    );

    console.log(lastTransaction, timeDifferenceFromLastTrx);
    if (dto.event === 'charge.completed') {
      console.log(dto);
      this.logger.log(
        `Charge completed webhook event received for ${dto.data.tx_ref} transaction`,
      );

      if (dto.data.status.toLocaleLowerCase() === 'successful') {
        if (lastTransaction.status !== 'success') {
          await this.paymentService.updateTransactionStatus(
            lastTransaction,
            'success',
            dto.data.id,
          );
          await this.paymentService.activateSubscriptionRelatedToTransaction(
            lastTransaction,
          );
          this.logger.log(`Payment was successful`);
        } else if (
          lastTransaction.status === 'success' &&
          timeDifferenceFromLastTrx > SECONDS_IN_A_DAY
        ) {
          const newTransaction = await this.paymentService.createNewTransaction(
            {
              amount: dto.data.amount,
              chargeType: 'DEBIT',
              initiatedBy: lastTransaction.initiatedBy,
              referenceCode: dto.data.tx_ref,
              type: lastTransaction.type,
              referredBy: lastTransaction.referredBy,
              paymentProcessorType: 'FLUTTERWAVE',
              status: TransactionStatus.success,
            },
          );
          await this.renewSubscriptionRelatedToTransaction(
            lastTransaction,
            newTransaction,
          );
        }
      }

      if (dto.data.status.toLocaleLowerCase() === 'failed') {
        // only update the failure status of the last transaction
        // if it doesn't have a success status to prevent updating
        // failure status on subscription renewal charge failure
        // it will be handled in subscription cancel event
        if (lastTransaction.status !== 'success') {
          await this.paymentService.updateTransactionStatus(
            lastTransaction,
            'failed',
            dto.data.id,
          );
          this.logger.log(`Payment failed`);
        }
      }
    }

    if (dto.event === 'subscription.cancelled') {
      console.log(dto.event);

      const customerEmail = dto.data.customer.email;

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
