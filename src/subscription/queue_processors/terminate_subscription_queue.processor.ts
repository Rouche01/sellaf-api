import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Job } from 'bullmq';
import { applicationConfig } from 'src/config';
import { QUEUES, TERMINATE_SUBSCRIPTION_QUEUE } from 'src/constants';
import { EMAIL_TEMPLATES } from 'src/interfaces';
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
      queueName: QUEUES.SEND_EMAIL_QUEUE,
      data: {
        recepient: userEmail,
        subject: 'Affiliate Subscription Expired',
        template: EMAIL_TEMPLATES.SUBSCRIPTION_EXPIRED,
        contextObj: {
          subscriptionExpired: {
            renewLink: `${this.appConfig.frontendUrl}/overview`,
          },
        },
      },
    });
  }
}
