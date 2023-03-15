import { Module } from '@nestjs/common';
import { PaymentModule } from 'src/payment';
import { QueueManagerModule, queues } from 'src/queue_manager';
import { RenewSubscriptionConsumer } from './queue_processors';
import { SubscriptionService } from './services';
import { SubscriptionController } from './subscription.controller';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, RenewSubscriptionConsumer],
  imports: [queues, PaymentModule, QueueManagerModule],
})
export class SubscriptionModule {}
