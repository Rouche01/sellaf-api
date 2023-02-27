import { Injectable } from '@nestjs/common';
import { InitiatePaymentArgs, PaymentStrategy } from '../interfaces';

@Injectable()
export class PaymentContext {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  makePayment(makePaymentArgs: InitiatePaymentArgs) {
    return this.strategy.initiatePayment(makePaymentArgs);
  }
}
