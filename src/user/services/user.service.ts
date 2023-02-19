import { Injectable, NotFoundException } from '@nestjs/common';
import { KeycloakUserService } from 'src/account';
import { AppLoggerService } from 'src/app_logger';
import { TransformedUser } from 'src/interfaces';
import { PrismaService } from 'src/prisma';
import { EditUserDto } from '../dtos';
import { GetAffiliateReferralsQueryDto } from '../dtos/get_affiliate_referrals_query.dto';
import { transformUserResponse } from '../utils';

@Injectable()
export class UserService {
  private readonly logger = new AppLoggerService(UserService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly keycloakUserService: KeycloakUserService,
  ) {}
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

  async getUser(userId: number): Promise<{ user: TransformedUser }> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        affiliate: {
          select: {
            affiliateCode: true,
            id: true,
            active: true,
            phoneNumber: true,
          },
        },
        seller: {
          select: {
            id: true,
            active: true,
            businessName: true,
            address: true,
            phoneNumber: true,
          },
        },
        userRoles: true,
      },
    });
    return {
      user: transformUserResponse(user),
    };
  }

  async updateAffiliateUserInfo(editUserPayload: EditUserDto, userId: number) {
    const { firstName, lastName, phoneNumber } = editUserPayload;
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.keycloakUserService.updateKeycloakUser(user.keycloakUserId, {
        firstName,
        lastName,
        attributes: {
          phoneNumber,
        },
      });

      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          firstName,
          lastName,
          affiliate: { update: { phoneNumber } },
        },
      });
      return {
        status: 'success',
        message: 'User info updated successfully.',
      };
    } catch (err) {
      this.logger.error(
        err?.message || 'Something went wrong with updating user',
      );
      throw err;
    }
  }
}
