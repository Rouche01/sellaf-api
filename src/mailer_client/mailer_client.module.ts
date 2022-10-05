import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
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
        template: {
          dir: join(__dirname, '../mails'),
          options: { strict: true },
          adapter: new HandlebarsAdapter(),
        },
      }),
    }),
  ],
})
export class MailerClientModule {}
