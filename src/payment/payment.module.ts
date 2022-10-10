import { Module } from '@nestjs/common';
import { PaymentService } from './services';

@Module({
  providers: [PaymentService],
})
export class PaymentModule {}
