import { DeleteBeneficiariesResponse } from 'src/interfaces';
import {
  AddTransferBeneficiariesArgs,
  AddTransferBeneficiariesResponse,
} from './add_transfer_beneficiaries.interface';
import { DeleteTransferBeneficiariesArgs } from './delete_transfer_beneficiaries.interface';
import { FetchBanksArgs, FetchBanksResponse } from './fetch_banks.interface';
import {
  InitiatePaymentArgs,
  InitiatePaymentResponse,
} from './initiate_payment.interface';
import {
  ResolveAccountNumberArgs,
  ResolveAccountNumberResponse,
} from './resolve_account_number.interface';
import { UseWebhookArgs } from './use_webhook.interface';

export interface PaymentStrategyInterface {
  initiatePayment(args: InitiatePaymentArgs): Promise<InitiatePaymentResponse>;

  getBankList?(args: FetchBanksArgs): Promise<FetchBanksResponse>;

  resolveBankAccountNumber?(
    args: ResolveAccountNumberArgs,
  ): Promise<ResolveAccountNumberResponse>;

  addTransferBeneficiaries?(
    args: AddTransferBeneficiariesArgs,
  ): Promise<AddTransferBeneficiariesResponse>;

  deleteTransferBeneficiaries?(
    args: DeleteTransferBeneficiariesArgs,
  ): Promise<DeleteBeneficiariesResponse>;

  useWebhook(args: UseWebhookArgs): Promise<void>;
}
