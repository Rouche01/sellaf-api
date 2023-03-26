import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KeycloakUserService } from 'src/account';
import { AppLoggerService } from 'src/app_logger';
import { AuthenticatedUser, TransformedUser } from 'src/interfaces';
import { PrismaService } from 'src/prisma';
import { GetAffiliateReferralsQueryDto } from '../dtos/get_affiliate_referrals_query.dto';
import { EditUserInfoPayload } from '../interfaces';
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
            bankDetails: true,
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

  async verifyUserEmailAndPassword(
    user: AuthenticatedUser,
    password: string,
    email: string,
  ) {
    const emailExists = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      throw new BadRequestException('User with this email exists');
    }

    await this.keycloakUserService.loginKeycloakUser(
      user.preferred_username,
      password,
    );
  }

  async updateAffiliateUserInfo(
    editUserPayload: EditUserInfoPayload,
    userId: number,
  ) {
    const { firstName, lastName, phoneNumber, emailAddress } = editUserPayload;
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { affiliate: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.keycloakUserService.updateKeycloakUser(user.keycloakUserId, {
        firstName,
        lastName,
        email: emailAddress,
        attributes: {
          phoneNumber: phoneNumber || user.affiliate.phoneNumber,
          affiliateId: user.affiliate.affiliateCode,
        },
      });

      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          firstName,
          lastName,
          email: emailAddress,
          affiliate: { update: { phoneNumber } },
        },
      });
      return {
        status: 'success',
        message: 'User information updated successfully.',
      };
    } catch (err) {
      this.logger.error(
        err?.message || 'Something went wrong with updating user',
      );
      throw err;
    }
  }
}
