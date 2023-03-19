import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { join } from 'path';
import { applicationConfig } from 'src/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (appConfig: ConfigType<typeof applicationConfig>) => ({
        transport: {
          host: appConfig.smtpHost,
          auth: {
            user: appConfig.smtpUsername,
            pass: appConfig.smtpPassword,
          },
        },
        template: {
          dir: join(__dirname, '../mails'),
          options: { strict: true },
          adapter: new HandlebarsAdapter(),
        },
      }),
      inject: [applicationConfig.KEY],
    }),
  ],
})
export class MailerClientModule {}
