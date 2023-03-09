import { PaymentProcessor } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class WebhookQueryDto {
  @IsNotEmpty()
  @IsEnum(PaymentProcessor)
  paymentProcessor: string;
}
