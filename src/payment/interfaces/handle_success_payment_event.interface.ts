import { CreateNewTransactionPayload } from './create_new_transaction.interface';
import { TransactionWithSubscription } from './transaction_with_subscription';

export interface OnSuccessfulPaymentArgs {
  lastTransaction: TransactionWithSubscription;
  processorTrxId: string;
  isNewTransaction: boolean;
  newTransactionPayload: CreateNewTransactionPayload;
}
