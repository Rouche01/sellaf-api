import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BullBoardModule } from 'src/bull_board';
import { mailBullConfig } from 'src/config';
import { SEND_EMAIL_QUEUE } from 'src/constants';
import { MailerClientModule } from 'src/mailer_client';
import { EmailConsumer } from './processors';
import { EmailService } from './services';

const bullModule = BullModule.forRootAsync({
  useFactory: () => mailBullConfig,
});
const emailBullQueue = BullModule.registerQueue({ name: SEND_EMAIL_QUEUE });

@Module({
  imports: [bullModule, emailBullQueue, MailerClientModule, BullBoardModule],
  providers: [EmailConsumer, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
