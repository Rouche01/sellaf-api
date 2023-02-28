import { Module } from '@nestjs/common';
import { FlutterwaveModule } from 'src/flutterwave';
import { PaymentController } from './payment.controller';
import { PaymentService, PaymentWebhookService } from './services';
import {
  CoinbaseStrategy,
  FlutterwaveStrategy,
  PaymentContext,
} from './strategy';

@Module({
  providers: [
    PaymentService,
    PaymentWebhookService,
    PaymentContext,
    FlutterwaveStrategy,
    CoinbaseStrategy,
  ],
  imports: [FlutterwaveModule],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
