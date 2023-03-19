import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue, Job } from 'bullmq';
import { SEND_EMAIL_QUEUE } from 'src/constants';
import { SendEmailJobData } from 'src/queue_manager';

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue(SEND_EMAIL_QUEUE)
    private readonly emailQueue: Queue<SendEmailJobData>,
  ) {}

  async addEmailJob<T extends { [key: string]: any }>({
    template,
    recepient,
    subject,
    contextObj,
  }: SendEmailJobData<T>): Promise<Job<SendEmailJobData>> {
    return this.emailQueue.add('test job', {
      template,
      recepient,
      contextObj,
      subject,
    });
  }
}
