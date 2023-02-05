import { Module } from '@nestjs/common';
import { PaymentModule } from 'src/payment';
import { SubscriptionService } from './services';
import { SubscriptionController } from './subscription.controller';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  imports: [PaymentModule],
})
export class SubscriptionModule {}
