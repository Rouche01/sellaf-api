import { Injectable } from '@nestjs/common';
import {
  InitiatePaymentArgs,
  InitiatePaymentResponse,
  PaymentStrategy,
} from './interfaces';

@Injectable()
export class CoinbaseStrategy implements PaymentStrategy {
  async initiatePayment(
    args: InitiatePaymentArgs,
  ): Promise<InitiatePaymentResponse> {
    return {
      paymentLink: '',
      status: '',
    };
  }
}
