import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account';
import { CoinbaseModule } from 'src/coinbase';
import { FlutterwaveModule } from 'src/flutterwave';
import { QueueManagerModule } from 'src/queue_manager';
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
  imports: [
    FlutterwaveModule,
    CoinbaseModule,
    QueueManagerModule,
    AccountModule,
  ],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
