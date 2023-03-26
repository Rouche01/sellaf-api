export const ROLES = {
  AFFILIATE: 'affiliate',
  SELLER: 'seller',
  'SELLER-ADMIN': 'seller-admin',
  'SUPER-ADMIN': 'super-admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
