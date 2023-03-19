import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TERMINATE_SUBSCRIPTION_QUEUE } from 'src/constants';
import { TerminateSubscriptionJobData } from 'src/queue_manager';
import { SubscriptionService } from '../services';

@Processor(TERMINATE_SUBSCRIPTION_QUEUE)
export class TerminateSubscriptionConsumer extends WorkerHost {
  constructor(private readonly subscriptionService: SubscriptionService) {
    super();
  }

  async process(job: Job<TerminateSubscriptionJobData>): Promise<any> {
    const { paymentProcessor, subscription, userEmail } = job.data;
    await this.subscriptionService.deactivateSubscription(subscription.id);
  }
}
