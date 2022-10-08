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
