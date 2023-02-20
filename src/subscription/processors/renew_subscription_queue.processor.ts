import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { RENEW_SUBSCRIPTION_QUEUE } from 'src/constants';
import { AddRenewSubscriptionJobData } from '../interfaces';

@Processor(RENEW_SUBSCRIPTION_QUEUE)
export class RenewSubscriptionConsumer extends WorkerHost {
  // constructor() {}

  async process(job: Job<AddRenewSubscriptionJobData>): Promise<void> {
    console.log(job);
  }
}
