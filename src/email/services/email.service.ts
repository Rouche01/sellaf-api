import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue, Job } from 'bullmq';
import { BullBoardService } from 'src/bull_board';

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('SEND_EMAIL') private readonly emailQueue: Queue,
    private readonly bullBoardService: BullBoardService,
  ) {
    this.bullBoardService.addToQueuePool(this.emailQueue);
  }

  async addEmailJob(
    message: string,
    emailAddr: string,
  ): Promise<Job<any, any, string>> {
    return this.emailQueue.add('test job', {
      message,
      emailAddr,
    });
  }
}
