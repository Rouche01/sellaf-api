import { Module } from '@nestjs/common';
import { FlutterwaveModule } from 'src/flutterwave';
import { PaymentController } from './payment.controller';
import { PaymentService, PaymentWebhookService } from './services';

@Module({
  providers: [PaymentService, PaymentWebhookService],
  imports: [FlutterwaveModule],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
