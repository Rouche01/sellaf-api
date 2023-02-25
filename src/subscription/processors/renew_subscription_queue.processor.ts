import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { RENEW_SUBSCRIPTION_QUEUE } from 'src/constants';
import { AddRenewSubscriptionJobData } from '../interfaces';
import { SubscriptionService } from '../services';
import { getDifferenceInSecondsFromNow } from '../../utils';

const SECONDS_IN_A_DAY = 86400;

@Processor(RENEW_SUBSCRIPTION_QUEUE)
export class RenewSubscriptionConsumer extends WorkerHost {
  constructor(private readonly subscriptionService: SubscriptionService) {
    super();
  }

  async process(job: Job<AddRenewSubscriptionJobData>): Promise<void> {
    const { user } = job.data;
    const activeSubscription =
      await this.subscriptionService.getAffiliateActiveSubscription(user);

    if (
      activeSubscription &&
      getDifferenceInSecondsFromNow(activeSubscription.endDate) >
        SECONDS_IN_A_DAY
    ) {
      throw new Error("Can't renew an active subscription");
    }

    if (activeSubscription) {
      await this.subscriptionService.deactivateSubscription(
        activeSubscription.id,
      );
    }

    await this.subscriptionService.createAffiliateSubscription(user);
  }
}
