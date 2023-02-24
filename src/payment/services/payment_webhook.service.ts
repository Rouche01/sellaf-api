import { Injectable } from '@nestjs/common';
import { Transaction, TransactionStatus } from '@prisma/client';
import add from 'date-fns/add';
import { AppLoggerService } from 'src/app_logger';
import { PrismaService } from 'src/prisma';
import { WebhookDto } from '../dtos';
import { PaymentService } from './payment.service';

@Injectable()
export class PaymentWebhookService {
  private readonly logger = new AppLoggerService(PaymentWebhookService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

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
        if (transaction.status !== 'success') {
          await this.paymentService.updateTransactionStatus(
            transaction,
            'success',
            dto.data.id,
          );
          await this.paymentService.activateSubscriptionRelatedToTransaction(
            transaction,
          );
          this.logger.log(`Payment was successful`);
        } else {
          const newTransaction = await this.paymentService.createNewTransaction(
            {
              amount: dto.data.amount,
              chargeType: 'DEBIT',
              initiatedBy: transaction.initiatedBy,
              referenceCode: dto.data.tx_ref,
              type: transaction.type,
              referredBy: transaction.referredBy,
              paymentProcessorType: 'FLUTTERWAVE',
              status: TransactionStatus.success,
            },
          );
          await this.renewSubscriptionRelatedToTransaction(
            transaction,
            newTransaction,
          );
        }
      }

      if (dto.data.status.toLocaleLowerCase() === 'failed') {
        await this.paymentService.updateTransactionStatus(
          transaction,
          'failed',
          dto.data.id,
        );
        this.logger.log(`Payment failed`);
      }
    }

    // if (dto.event === '')
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
