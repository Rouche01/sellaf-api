import { TransactionWithSubscription } from './transaction_with_subscription';

export interface OnFailedPaymentArgs {
  lastTransaction: TransactionWithSubscription;
  processorTrxId: string;
}
