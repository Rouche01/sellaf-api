import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BullBoardModule } from 'src/bull_board';
import { mailBullConfig } from 'src/config';
import { RENEW_SUBSCRIPTION_QUEUE } from 'src/constants';
import { PaymentModule } from 'src/payment';
import { RenewSubscriptionConsumer } from './processors';
import { SubscriptionService } from './services';
import { SubscriptionController } from './subscription.controller';

const bullModule = BullModule.forRootAsync({
  useFactory: () => mailBullConfig,
});
const subscriptionBullQueues = BullModule.registerQueue({
  name: RENEW_SUBSCRIPTION_QUEUE,
});

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, RenewSubscriptionConsumer],
  imports: [bullModule, subscriptionBullQueues, PaymentModule, BullBoardModule],
})
export class SubscriptionModule {}
