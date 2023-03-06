import { PaymentProcessor } from '@prisma/client';
import { AuthenticatedUser } from 'src/interfaces';

export interface AddRenewSubscriptionJobData {
  user: AuthenticatedUser;
  paymentProcessor: PaymentProcessor;
}
