import { PrismaService } from 'src/prisma';
import {
  CreateNewTransactionPayload,
  TransactionWithSubscription,
} from '../interfaces';

export class BaseStrategy {
  constructor(protected readonly prismaService: PrismaService) {}

  protected async createNewTransaction(payload: CreateNewTransactionPayload) {
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
        status: payload.status,
      },
    });

    return transaction;
  }

  protected async activateSubscriptionForTransaction(
    transactionWithSubscription: TransactionWithSubscription,
  ) {
    await this.prismaService.subscription.update({
      where: { id: transactionWithSubscription.subscriptionId },
      data: { active: true, willRenew: true },
    });
  }

  protected async deactivateSubscriptionForTransaction(
    transactionWithSubscription: TransactionWithSubscription,
  ) {
    await this.prismaService.subscription.update({
      where: { id: transactionWithSubscription.subscriptionId },
      data: { active: false, activeTransactionId: null, willRenew: false },
    });
  }
}
