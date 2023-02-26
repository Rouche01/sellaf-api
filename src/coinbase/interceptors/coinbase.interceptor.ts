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
export class CoinbaseInterceptor implements NestInterceptor {
  constructor(
    private readonly httpService: HttpService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
  ) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    this.httpService.axiosRef.defaults.headers.common['X-CC-Api-Key'] =
      this.appConfig.coinbase.apiKey;
    this.httpService.axiosRef.defaults.headers.common['X-CC-Version'] =
      '2018-03-22';
    return next.handle().pipe();
  }
}
