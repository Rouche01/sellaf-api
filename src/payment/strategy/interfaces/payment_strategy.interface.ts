import { FetchBanksArgs, FetchBanksResponse } from './fetch_banks.interface';
import {
  InitiatePaymentArgs,
  InitiatePaymentResponse,
} from './initiate_payment.interface';

export interface PaymentStrategy {
  initiatePayment(args: InitiatePaymentArgs): Promise<InitiatePaymentResponse>;

  getBankList?(args: FetchBanksArgs): Promise<FetchBanksResponse>;
}
