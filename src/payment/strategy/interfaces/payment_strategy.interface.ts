import { FetchBanksArgs, FetchBanksResponse } from './fetch_banks.interface';
import {
  InitiatePaymentArgs,
  InitiatePaymentResponse,
} from './initiate_payment.interface';
import { UseWebhookArgs } from './use_webhook.interface';

export interface PaymentStrategyInterface {
  initiatePayment(args: InitiatePaymentArgs): Promise<InitiatePaymentResponse>;

  getBankList?(args: FetchBanksArgs): Promise<FetchBanksResponse>;

  useWebhook(args: UseWebhookArgs): Promise<void>;
}
