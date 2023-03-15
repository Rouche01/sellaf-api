import { Module } from '@nestjs/common';
import { BullBoardModule } from 'src/bull_board';
import { MailerClientModule } from 'src/mailer_client';
import { QueueManagerModule, queues } from 'src/queue_manager';
import { EmailConsumer } from './queue_processors';
import { EmailService } from './services';

@Module({
  imports: [queues, MailerClientModule, BullBoardModule, QueueManagerModule],
  providers: [EmailConsumer, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
