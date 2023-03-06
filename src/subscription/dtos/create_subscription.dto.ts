import { PaymentProcessor } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreateSubscriptionDto {
  @IsEnum(PaymentProcessor)
  paymentProcessor: PaymentProcessor;
}
