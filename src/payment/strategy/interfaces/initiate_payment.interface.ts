import { SubscriptionPlan, TransactionType, Transaction } from '@prisma/client';
import { AuthenticatedUser } from 'src/interfaces';
import { CreateNewTransactionPayload } from 'src/payment/interfaces';

export interface InitiatePaymentArgs {
  user: AuthenticatedUser;
  paymentMeta: Record<string, any>;
  amount: string;
  transactionType: TransactionType;
  subscriptionPlan?: SubscriptionPlan;
  description?: string;
  createTransactionRecord: (payload: CreateNewTransactionPayload) => Promise<Transaction>;
}

export interface InitiatePaymentResponse {
  status: string;
  paymentLink: string;
  transactionId?: number;
}
