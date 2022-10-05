import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue, Job } from 'bullmq';
import { BullBoardService } from 'src/bull_board';
import { EmailJobData } from '../interfaces';

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('SEND_EMAIL')
    private readonly emailQueue: Queue<EmailJobData>,
    private readonly bullBoardService: BullBoardService,
  ) {
    this.bullBoardService.addToQueuePool(this.emailQueue);
  }

  async addEmailJob<T extends { [key: string]: any }>({
    template,
    recepient,
    subject,
    contextObj,
  }: EmailJobData<T>): Promise<Job<EmailJobData>> {
    return this.emailQueue.add('test job', {
      template,
      recepient,
      contextObj,
      subject,
    });
  }
}
