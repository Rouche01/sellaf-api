import { Country, Currency } from 'src/interfaces';

export interface PayWithCardResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    currency: Currency;
    ip: string;
    narration: string;
    status: string;
    auth_url: string;
    payment_type: string;
    fraud_status: string;
    charge_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      phone_number: string | null;
      name: string;
      email: string;
      created_at: string;
    };
    card: {
      first_6digits: string;
      last_4digits: string;
      issuer: string;
      country: Country;
      type: string;
      expiry: string;
    };
  };
}
