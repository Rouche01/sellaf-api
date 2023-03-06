import { Injectable } from '@nestjs/common';
import {
  FetchBanksArgs,
  InitiatePaymentArgs,
  PaymentStrategy,
} from '../interfaces';

@Injectable()
export class PaymentContext {
  private strategy: PaymentStrategy;

  // constructor(strategy: PaymentStrategy) {
  //   this.strategy = strategy;
  // }

  setStrategy(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  makePayment(makePaymentArgs: InitiatePaymentArgs) {
    return this.strategy.initiatePayment(makePaymentArgs);
  }

  fetchBankList(fetchBankArgs: FetchBanksArgs) {
    return this.strategy.getBankList(fetchBankArgs);
  }
}
