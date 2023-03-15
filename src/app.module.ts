import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AccountModule } from './account';
import { applicationConfig, validationSchema } from './config';
import { PrismaModule } from './prisma';
import { BullBoardModule } from './bull_board';
import { AppLoggerMiddleware, AppLoggerModule } from './app_logger';
import {
  AuthGuard,
  KeycloakConnectModule,
  RoleGuard,
} from 'nest-keycloak-connect';
import { KeycloakAuthModule, KeycloakAuthService } from './keycloak_auth';
import { APP_GUARD } from '@nestjs/core';
import { PlatformSetupModule } from './platform_setup';
import { StoreModule } from './store';
import { PaymentModule } from './payment';
import { UserModule } from './user';
import { SubscriptionModule } from './subscription';
import { CoinbaseModule } from './coinbase';
import { QueueManagerModule } from './queue_manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [applicationConfig],
      validationSchema,
    }),
    KeycloakConnectModule.registerAsync({
      useExisting: KeycloakAuthService,
      imports: [KeycloakAuthModule],
    }),
    AccountModule,
    PrismaModule,
    BullBoardModule,
    AppLoggerModule,
    PlatformSetupModule,
    StoreModule,
    PaymentModule,
    UserModule,
    SubscriptionModule,
    CoinbaseModule,
    QueueManagerModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
