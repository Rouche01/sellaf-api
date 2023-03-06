import { SubscriptionPlan, TransactionType } from '@prisma/client';
import { AuthenticatedUser } from 'src/interfaces';

export interface InitiatePaymentArgs {
  user: AuthenticatedUser;
  paymentMeta: Record<string, any>;
  amount: string;
  transactionType: TransactionType;
  subscriptionPlan?: SubscriptionPlan;
  description?: string;
}

export interface InitiatePaymentResponse {
  status: string;
  paymentLink: string;
  transactionId?: number;
}
