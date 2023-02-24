import { BaseAdapter } from '@bull-board/api/dist/src/queueAdapters/base';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { AppLoggerService } from 'src/app_logger';

@Injectable()
export class BullBoardService {
  private readonly logger = new AppLoggerService(BullBoardService.name);
  private readonly queuePool: Set<Queue>;

  constructor() {
    this.queuePool = new Set();
  }

  addToQueuePool(queue: Queue): void {
    this.queuePool.add(queue);
  }

  getBullBoardQueues(): BaseAdapter[] {
    const bullBoardQueues = [...this.queuePool].reduce(
      (acc: BaseAdapter[], val) => {
        acc.push(new BullAdapter(val));
        return acc;
      },
      [],
    );

    return bullBoardQueues;
  }

  async getQueueJob<T>(jobId: string, queue: Queue<T>): Promise<Job<T>> {
    const job = await queue.getJob(jobId);
    this.logger.log(`Retrieved ${job.name} queue job.`);
    return job;
  }

  async removeQueueJob<T>(jobId: string, queue: Queue<T>) {
    await queue.remove(jobId);
    this.logger.log(`Removed queue job with id: ${jobId}`);
  }
}
