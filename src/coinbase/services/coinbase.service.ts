import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AppLoggerService } from 'src/app_logger';
import { applicationConfig } from 'src/config';
import { CreateChargePayload, CreateChargeResponse } from '../interfaces';
import { computeSignature, secureCompare } from '../util';

@Injectable()
export class CoinbaseService {
  private readonly logger = new AppLoggerService(CoinbaseService.name);
  constructor(
    private readonly httpService: HttpService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
  ) {}

  async createCharge(createChargePayload: CreateChargePayload) {
    const chargePayload = {
      name: createChargePayload.name,
      description: createChargePayload.description,
      pricing_type: 'fixed_price',
      local_price: {
        amount: createChargePayload.amount,
        currency: createChargePayload.currency,
      },
      metadata: {
        trx_ref: createChargePayload.referenceCode,
        ...createChargePayload.paymentMetadata,
      },
      redirect_url: `${this.appConfig.frontendUrl}/overview`,
    };

    try {
      const chargeResponse = await lastValueFrom(
        this.httpService
          .post<CreateChargeResponse>('/charges', chargePayload)
          .pipe(),
      );

      console.log(chargeResponse);

      return {
        status: 'successful',
        paymentLink: chargeResponse.data.data.hosted_url,
      };
    } catch (err) {
      this.logger.error(err?.response?.data || err?.message);
      throw err;
    }
  }

  verifySignatureHeader(rawBody: Buffer, signature: string, secret: string) {
    const computedSignature = computeSignature(rawBody, secret);
    if (!secureCompare(computedSignature, signature)) {
      return false;
    }
    return true;
  }
}
