import {
  InitiatePaymentArgs,
  InitiatePaymentResponse,
  PaymentStrategy,
} from './interfaces';

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
