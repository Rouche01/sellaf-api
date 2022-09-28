import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AccountModule } from './account';
import { applicationConfig, validationSchema } from './config';

@Module({
  imports: [
    AccountModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [applicationConfig],
      validationSchema,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
