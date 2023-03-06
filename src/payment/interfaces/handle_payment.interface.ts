import { PaymentProcessor } from '@prisma/client';
import { InitiatePaymentArgs } from '../strategy/interfaces';

export interface HandlePaymentArgs {
  initiatePaymentArgs: InitiatePaymentArgs;
  paymentProcessor: PaymentProcessor;
}
