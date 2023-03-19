import { PaymentProcessor } from '@prisma/client';
import { AuthenticatedUser } from 'src/interfaces';

export interface RenewSubscriptionJobData {
  user: AuthenticatedUser;
  paymentProcessor: PaymentProcessor;
}
