import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { AppLoggerService } from 'src/app_logger';
import { BullBoardService } from 'src/bull_board';
import {
  RENEW_SUBSCRIPTION_QUEUE,
  SEND_EMAIL_QUEUE,
  TERMINATE_SUBSCRIPTION_QUEUE,
} from 'src/constants';

@Injectable()
export class QueueManagerService {
  private readonly logger = new AppLoggerService(QueueManagerService.name);

  constructor(
    @InjectQueue(RENEW_SUBSCRIPTION_QUEUE)
    private readonly renewSubscriptionQueue: Queue,
    @InjectQueue(SEND_EMAIL_QUEUE)
    private readonly sendEmailQueue: Queue,
    @InjectQueue(TERMINATE_SUBSCRIPTION_QUEUE)
    private readonly terminateSubscriptionQueue: Queue,
    private readonly bullboardService: BullBoardService,
  ) {
    const queueArr = [
      this.sendEmailQueue,
      this.renewSubscriptionQueue,
      this.terminateSubscriptionQueue,
    ];
    queueArr.forEach((queue) => this.bullboardService.addToQueuePool(queue));
  }

  async getQueueJob<T>(jobId: string, queue: Queue<T>): Promise<Job<T>> {
    const job = await queue.getJob(jobId);
    this.logger.log(`Retrieved ${job.name} queue job.`);
    return job;
  }

  async removeQueueJob<T>(jobId: string, queue: Queue<T>) {
    await queue.remove(jobId);
    this.logger.log(`Removed queue job with id: ${jobId}`);
  }

  // async addJob<T>() {

  // }
}
