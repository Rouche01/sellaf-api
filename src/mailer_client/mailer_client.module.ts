import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { applicationConfig } from 'src/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: applicationConfig().smtpHost,
          auth: {
            user: applicationConfig().smtpUsername,
            pass: applicationConfig().smtpPassword,
          },
        },
      }),
    }),
  ],
})
export class MailerClientModule {}
