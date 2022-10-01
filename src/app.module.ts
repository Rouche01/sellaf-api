import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AccountModule } from './account';
import { applicationConfig, validationSchema } from './config';
import { PrismaModule } from './prisma';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [applicationConfig],
      validationSchema,
    }),
    AccountModule,
    PrismaModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
