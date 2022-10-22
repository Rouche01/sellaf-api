import { Currency } from 'src/interfaces';

export interface PayWithCardPayload {
  amount: number;
  currency: Currency;
  cardNumber: number;
  cvv: number;
  expiryMonth: number;
  expiryYear: number;
  email: string;
  txRef: string;
  fullName: string;
}
