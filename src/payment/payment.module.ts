import { Module } from '@nestjs/common';
import { CoinbaseModule } from 'src/coinbase';
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
  imports: [FlutterwaveModule, CoinbaseModule],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
