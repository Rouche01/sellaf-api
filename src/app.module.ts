import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AccountModule } from './account';
import { applicationConfig, validationSchema } from './config';
import { PrismaModule } from './prisma';
import { BullBoardModule } from './bull_board';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [applicationConfig],
      validationSchema,
    }),
    AccountModule,
    PrismaModule,
    BullBoardModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
