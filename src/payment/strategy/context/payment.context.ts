import { Injectable } from '@nestjs/common';
import {
  FetchBanksArgs,
  InitiatePaymentArgs,
  PaymentStrategyInterface,
  UseWebhookArgs,
} from '../interfaces';

@Injectable()
export class PaymentContext {
  private strategy: PaymentStrategyInterface;

  // constructor(private readonly prismaService: PrismaService) {}

  setStrategy(strategy: PaymentStrategyInterface) {
    this.strategy = strategy;
  }

  makePayment(makePaymentArgs: InitiatePaymentArgs) {
    return this.strategy.initiatePayment(makePaymentArgs);
  }

  fetchBankList(fetchBankArgs: FetchBanksArgs) {
    return this.strategy.getBankList(fetchBankArgs);
  }

  useWebhook(useWebhookArgs: UseWebhookArgs): Promise<void> {
    return this.strategy.useWebhook(useWebhookArgs);
  }
}
