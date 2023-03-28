import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AuditLogRecordType } from '@prisma/client';
import { KeycloakUserService } from 'src/account';
import { AppLoggerService } from 'src/app_logger';
import { applicationConfig } from 'src/config';
import { QUEUES } from 'src/constants';
import {
  AuthenticatedUser,
  EMAIL_TEMPLATES,
  PasswordUpdatedTemplateContext,
  ROLES,
  TransformedUser,
} from 'src/interfaces';
import { PrismaService } from 'src/prisma';
import { QueueManagerService, SendEmailJobData } from 'src/queue_manager';
import { checkUserRole } from 'src/utils';
import { UpdateUserPasswordDto } from '../dtos';
import { GetAffiliateReferralsQueryDto } from '../dtos/get_affiliate_referrals_query.dto';
import { EditUserInfoPayload } from '../interfaces';
import { transformUserResponse } from '../utils';

@Injectable()
export class UserService {
  private readonly logger = new AppLoggerService(UserService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly keycloakUserService: KeycloakUserService,
    private readonly queueManagerService: QueueManagerService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
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

  async updateUserPassword(userId: number, dto: UpdateUserPasswordDto) {
    const userToEdit = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!userToEdit) {
      throw new NotFoundException('User not found');
    }
    // make sure that supplied password is correct
    await this.keycloakUserService.loginKeycloakUser(
      userToEdit.username,
      dto.currentPassword,
    );

    await this.keycloakUserService.resetUserPassword(
      dto.newPassword,
      userToEdit.keycloakUserId,
    );
    await this.queueManagerService.addJob<
      SendEmailJobData<PasswordUpdatedTemplateContext>
    >({
      jobId: userToEdit.id.toString(),
      jobName: 'Password Updated Email Job',
      queueName: QUEUES.SEND_EMAIL_QUEUE,
      data: {
        contextObj: {
          data: {
            firstName: userToEdit.firstName,
            userAccount: `${this.appConfig.frontendUrl}/profile`,
          },
        },
        recepient: userToEdit.email,
        subject: 'Password updated',
        template: EMAIL_TEMPLATES.PASSWORD_CHANGED,
      },
    });
    return { status: 'success', message: 'Password updated successfully.' };
  }

  async deleteUserAccount(
    userId: number,
    password: string,
    user: AuthenticatedUser,
  ) {
    const userToDelete = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        ...(checkUserRole(ROLES.AFFILIATE, user) && { affiliate: true }),
        ...(checkUserRole(ROLES['SELLER-ADMIN'], user) && {
          seller: {
            include: {
              stores: {
                include: {
                  products: true,
                },
              },
            },
          },
        }),
        userRoles: true,
      },
    });

    if (!userToDelete) {
      throw new NotFoundException('User not found');
    }

    const stringifiedUserData = JSON.stringify(userToDelete);
    await this.keycloakUserService.loginKeycloakUser(
      userToDelete.username,
      password,
    );

    await this.prismaService.$transaction([
      this.prismaService.user.delete({ where: { id: userId } }),
      this.prismaService.auditLog.create({
        data: { content: stringifiedUserData, record: AuditLogRecordType.USER },
      }),
    ]);

    // TO-DO: Stop active subscription and disable renewal of subscription for affiliate

    await this.keycloakUserService.logoutKeycloakUser(
      userToDelete.keycloakUserId,
    );
    await this.keycloakUserService.deleteKeycloakUser(
      userToDelete.keycloakUserId,
    );

    return { status: 'success', message: 'User account deleted successfully.' };
  }
}
