import { PaymentProcessor, Subscription } from '@prisma/client';
// import { AuthenticatedUser } from 'src/interfaces';

export interface TerminateSubscriptionJobData {
  userEmail: string;
  paymentProcessor: PaymentProcessor;
  subscription: Subscription;
}
