import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Job } from 'bullmq';
import { applicationConfig } from 'src/config';
import { TERMINATE_SUBSCRIPTION_QUEUE } from 'src/constants';
import {
  QueueManagerService,
  SendEmailJobData,
  TerminateSubscriptionJobData,
} from 'src/queue_manager';
import { SubscriptionExpiredContext } from '../interfaces';
import { SubscriptionService } from '../services';

@Processor(TERMINATE_SUBSCRIPTION_QUEUE)
export class TerminateSubscriptionConsumer extends WorkerHost {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly queueManager: QueueManagerService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
  ) {
    super();
  }

  async process(job: Job<TerminateSubscriptionJobData>): Promise<any> {
    const { subscription, userEmail } = job.data;
    await this.subscriptionService.deactivateSubscription(subscription.id);

    await this.queueManager.addJob<
      SendEmailJobData<SubscriptionExpiredContext>
    >({
      jobName: 'Send Renew Subscription Email',
      jobId: subscription.id.toString(),
      queueName: 'SEND_EMAIL',
      data: {
        recepient: userEmail,
        subject: 'Affiliate Subscription Expired',
        template: 'subscription_expired',
        contextObj: {
          subscriptionExpired: {
            renewLink: `${this.appConfig.frontendUrl}/overview`,
          },
        },
      },
    });
  }
}
