import { HttpService } from '@nestjs/axios';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Observable } from 'rxjs';
import { applicationConfig } from 'src/config';

@Injectable()
export class FlutterwaveInterceptor implements NestInterceptor {
  constructor(
    private readonly httpService: HttpService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
  ) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // TO-DO: Conditionally use test key or live key based on the app environment
    this.httpService.axiosRef.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${this.appConfig.flutterwave.testSecretKey}`;
    return next.handle().pipe();
  }
}
