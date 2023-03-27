export const EMAIL_TEMPLATES = {
  AFFILIATE_VERIFICATION: 'affiliate_verification',
  PASSWORD_CHANGED: 'password_changed',
  RESET_TOKEN: 'reset_token',
  SELLER_CONFIRMATION: 'seller_confirmation',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
} as const;

export type EmailTemplate =
  typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES];
