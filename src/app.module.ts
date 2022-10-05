import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AccountModule } from './account';
import { applicationConfig, validationSchema } from './config';
import { PrismaModule } from './prisma';
import { BullBoardModule } from './bull_board';
import { AppLoggerMiddleware, AppLoggerModule } from './app_logger';

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
    AppLoggerModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
