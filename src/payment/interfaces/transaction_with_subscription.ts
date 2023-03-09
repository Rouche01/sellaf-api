import { Subscription, Transaction } from '@prisma/client';

export interface TransactionWithSubscription extends Transaction {
  subscription: Subscription;
}
