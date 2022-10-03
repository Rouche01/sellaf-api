import { BaseAdapter } from '@bull-board/api/dist/src/queueAdapters/base';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BullBoardService {
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
