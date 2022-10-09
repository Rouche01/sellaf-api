export const CURRENCIES = {
  NGN: 'NGN',
  GHS: 'GHS',
  KES: 'KES',
  RWF: 'RWF',
} as const;

export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];
