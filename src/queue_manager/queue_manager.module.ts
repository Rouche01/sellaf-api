import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BullBoardModule } from 'src/bull_board';
import { bullMqConfig } from 'src/config';
import {
  RENEW_SUBSCRIPTION_QUEUE,
  TERMINATE_SUBSCRIPTION_QUEUE,
  SEND_EMAIL_QUEUE,
} from 'src/constants/queues';
import { QueueManagerService } from './services';

const bullModule = BullModule.forRootAsync({
  useFactory: () => bullMqConfig,
});

export const queues = BullModule.registerQueueAsync(
  { name: RENEW_SUBSCRIPTION_QUEUE },
  { name: TERMINATE_SUBSCRIPTION_QUEUE },
  { name: SEND_EMAIL_QUEUE },
);

@Module({
  imports: [bullModule, queues, BullBoardModule],
  exports: [queues, QueueManagerService],
  providers: [QueueManagerService],
})
export class QueueManagerModule {}
