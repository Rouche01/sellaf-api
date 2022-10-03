import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardService } from './services';
import { mailBullConfig } from 'src/config';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';

@Module({
  imports: [BullModule.forRoot(mailBullConfig)],
  providers: [BullBoardService],
  exports: [BullBoardService],
})
export class BullBoardModule implements NestModule {
  constructor(private readonly bullBoardService: BullBoardService) {}

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();

    const queues = this.bullBoardService.getBullBoardQueues();
    createBullBoard({ queues, serverAdapter });
    serverAdapter.setBasePath('/admin/queues');

    consumer.apply(serverAdapter.getRouter()).forRoutes('/admin/queues');
  }
}
