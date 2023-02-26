import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { applicationConfig } from 'src/config';
import { CoinbaseController } from './coinbase.controller';
import { CoinbaseInterceptor } from './interceptors';
import { CoinbaseService } from './services';

@Module({
  providers: [
    CoinbaseService,
    { provide: APP_INTERCEPTOR, useClass: CoinbaseInterceptor },
  ],
  imports: [
    HttpModule.registerAsync({
      inject: [applicationConfig.KEY],
      useFactory: (appConfig: ConfigType<typeof applicationConfig>) => {
        return {
          baseURL: appConfig.coinbase.apiBaseUrl,
          maxRedirects: 0,
        };
      },
    }),
  ],
  controllers: [CoinbaseController],
})
export class CoinbaseModule {}
