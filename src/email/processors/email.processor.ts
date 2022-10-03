import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('SEND_EMAIL')
export class EmailConsumer extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(
    job: Job<{ message: string; emailAddr: string }>,
  ): Promise<void> {
    await this.mailerService.sendMail({
      from: '"No Reply" <noreply@adverts247.com>',
      to: job.data.emailAddr,
      subject: 'Test Email',
      text: job.data.message,
    });
  }
}
