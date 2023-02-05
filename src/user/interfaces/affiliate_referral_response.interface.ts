import { Affiliate, User } from '@prisma/client';

interface Referral extends Affiliate {
  user: User;
}

export interface AffiliateReferralResponse {
  referrals: Referral[];
  totalCount: number;
  verifiedCount: number;
  unverifiedCount: number;
}
