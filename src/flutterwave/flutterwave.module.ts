import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { applicationConfig } from 'src/config';
import { FlutterwaveInterceptor } from './interceptors';
import { FlutterwaveService } from './services';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [applicationConfig.KEY],
      useFactory: (appConfig: ConfigType<typeof applicationConfig>) => {
        return {
          baseURL: appConfig.flutterwave.apiBaseUrl,
          maxRedirects: 0,
        };
      },
    }),
  ],
  providers: [
    FlutterwaveService,
    { provide: APP_INTERCEPTOR, useClass: FlutterwaveInterceptor },
  ],
  exports: [FlutterwaveService],
})
export class FlutterwaveModule {}
