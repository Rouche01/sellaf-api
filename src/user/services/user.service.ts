import { Injectable } from '@nestjs/common';
import { AppLoggerService } from 'src/app_logger';
import { PrismaService } from 'src/prisma';
import { GetAffiliateReferralsQueryDto } from '../dtos/get_affiliate_referrals_query.dto';

@Injectable()
export class UserService {
  private readonly logger = new AppLoggerService(UserService.name);
  constructor(private readonly prismaService: PrismaService) {}
  async fetchAffiliateReferredUsers(
    affiliateId: number,
    params: GetAffiliateReferralsQueryDto,
  ) {
    try {
      const { limit, skip } = params;
      const referrals = await this.prismaService.affiliate.findMany({
        where: { referredBy: affiliateId },
        include: { user: true },
        ...(limit && { take: limit }),
        ...(skip && { skip }),
      });

      const referralCount = await this.prismaService.affiliate.count({
        where: { referredBy: affiliateId },
      });

      const unverifiedReferralCount = await this.prismaService.affiliate.count({
        where: { referredBy: affiliateId, active: false },
      });

      const verifiedReferralCount = await this.prismaService.affiliate.count({
        where: { referredBy: affiliateId, active: true },
      });

      return {
        referrals,
        totalCount: referralCount,
        unverifiedCount: unverifiedReferralCount,
        verifiedCount: verifiedReferralCount,
      };
    } catch (err) {
      this.logger.error(err?.message || 'Something went wrong');
      throw err;
    }
  }
}
