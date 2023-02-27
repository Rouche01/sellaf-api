import { InitiatePaymentArgs } from '../strategy/interfaces';

export interface HandlePaymentArgs {
  initiatePaymentArgs: InitiatePaymentArgs;
  paymentProcessor: 'flutterwave' | 'coinbase';
}
