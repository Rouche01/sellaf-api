import { Currency } from 'src/interfaces';

export interface PayWithStandardFlowPayload {
  amount: string;
  currency: Currency;
  redirect_url: string;
  meta: Record<string, string | number>;
  customer: {
    email: string;
    phonenumber?: string;
    name?: string;
  };
  payment_options: string;
  payment_plan: string;
}
