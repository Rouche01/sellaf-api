import { BaseAdapter } from '@bull-board/api/dist/src/queueAdapters/base';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
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
}
