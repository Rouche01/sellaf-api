export const COUNTRIES = {
  NG: 'NG',
  GH: 'GH',
  KE: 'KE',
  RW: 'RW',
} as const;

export type Country = typeof COUNTRIES[keyof typeof COUNTRIES];
