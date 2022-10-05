import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailJobData } from '../interfaces';

@Processor('SEND_EMAIL')
export class EmailConsumer extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    await this.mailerService.sendMail({
      from: '"Sellaf Africa" <noreply@adverts247.com>',
      to: job.data.recepient,
      subject: job.data.subject,
      template: job.data.template,
      context: {
        affiliateVerification: {
          ...job.data.contextObj,
        },
      },
    });
  }
}
