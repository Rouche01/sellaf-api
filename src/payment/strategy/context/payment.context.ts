import { Injectable } from '@nestjs/common';
import {
  AddTransferBeneficiariesArgs,
  DeleteTransferBeneficiariesArgs,
  FetchBanksArgs,
  InitiatePaymentArgs,
  PaymentStrategyInterface,
  ResolveAccountNumberArgs,
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

  resolveBankAccountNumber(resolveArgs: ResolveAccountNumberArgs) {
    return this.strategy.resolveBankAccountNumber(resolveArgs);
  }

  addTransferBeneficiaries(addBeneficiariesArgs: AddTransferBeneficiariesArgs) {
    return this.strategy.addTransferBeneficiaries(addBeneficiariesArgs);
  }

  deleteTransferBeneficiaries(
    deleteBeneficiariesArgs: DeleteTransferBeneficiariesArgs,
  ) {
    return this.strategy.deleteTransferBeneficiaries(deleteBeneficiariesArgs);
  }

  useWebhook(useWebhookArgs: UseWebhookArgs): Promise<void> {
    return this.strategy.useWebhook(useWebhookArgs);
  }
}
