import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import add from 'date-fns/add';
import { EmailService } from 'src/email';
import {
  PasswordUpdatedContext,
  SellerConfirmationContext,
  UserGroups,
} from '../interfaces';
import { PrismaService } from 'src/prisma';
import {
  constructVerificationLink,
  generateAffiliateId,
  generateUniqueUsername,
  isTokenExpired,
} from 'src/account/utils';
import {
  AffiliateRegisterDto,
  AffiliateVerifyQueryDto,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordConfirmDto,
  ResetPasswordDto,
  SellerRegisterDto,
} from '../dtos';
import { KeycloakUserService } from './keycloak_user.service';
import { applicationConfig } from 'src/config';
import {
  generateConfirmationToken,
  verifyConfirmationToken,
  encryptToken,
} from '../utils';
import { AffiliateRegisterContext, LoginResponse } from '../interfaces';
import { AppLoggerService } from 'src/app_logger';

import { ConfigType } from '@nestjs/config';
import { ResetTokenContext } from '../interfaces/reset_token_context.interface';
import { AuthenticatedUser } from 'src/interfaces';
import { transformUserResponse } from '../utils/transform_user_response.util';
import { Affiliate } from '@prisma/client';

@Injectable()
export class AccountService {
  private readonly logger = new AppLoggerService(AccountService.name);

  constructor(
    private readonly keycloakUserService: KeycloakUserService,
    private readonly prismaService: PrismaService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
    private readonly emailService?: EmailService,
  ) {}

  async createAffiliateUser(
    dto: AffiliateRegisterDto,
    userGroup: Array<UserGroups>,
  ): Promise<{ userId: number; message: string }> {
    const affiliateId = generateAffiliateId();
    const username = generateUniqueUsername({
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    const confirmationToken = generateConfirmationToken();
    const encryptedToken = await encryptToken(
      +this.appConfig.bcryptTokenSalt,
      confirmationToken,
    );

    const keycloakAttrs = {
      affiliateId: [affiliateId],
      phoneNumber: [dto.phoneNumber],
    };

    const kcUserId = await this.keycloakUserService.createKeycloakUser({
      userData: dto,
      userGroup,
      username,
      userAttrs: keycloakAttrs,
    });

    let referredBy: Affiliate;

    if (dto.referrerId) {
      referredBy = await this.prismaService.affiliate.findFirst({
        where: { affiliateCode: dto.referrerId },
      });
    }
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          username,
          keycloakUserId: kcUserId,
          affiliate: {
            create: {
              phoneNumber: dto.phoneNumber,
              affiliateCode: affiliateId,
              ...(referredBy && { referredBy: referredBy.id }),
            },
          },
          userRoles: {
            create: [{ role: 'ROLE_AFFILIATE' }],
          },
          confirmationToken: {
            create: {
              expiresAt: add(new Date(), { hours: 24 }),
              token: encryptedToken,
            },
          },
        },
      });

      const emailJobResp =
        await this.emailService.addEmailJob<AffiliateRegisterContext>({
          template: 'affiliate_verification',
          contextObj: {
            affiliateVerification: {
              firstName: dto.firstName,
              email: dto.email,
              verificationLink: constructVerificationLink(
                this.appConfig.frontendUrl,
                confirmationToken,
                dto.email,
              ),
            },
          },
          recepient: dto.email,
          subject: 'Verify your Email',
        });
      this.logger.log({
        emailJobSuccess: !!emailJobResp.failedReason,
        failedReason: emailJobResp.failedReason,
      });
      return { userId: user.id, message: 'Affiliate created successfully!' };
    } catch (err) {
      this.logger.error(
        err?.message || 'Something went wrong with creating an affiliate',
      );
      throw err;
    }
  }

  async createSellerUser(
    dto: SellerRegisterDto,
    userGroup: Array<UserGroups>,
  ): Promise<{ userId: number; message: string }> {
    const username = generateUniqueUsername({
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
    const keycloakAttrs = {
      phoneNumber: [dto.phoneNumber],
      businessName: [dto.businessName],
      address: [dto.address],
    };

    try {
      const kcUserId = await this.keycloakUserService.createKeycloakUser({
        userData: dto,
        username,
        userGroup,
        userAttrs: keycloakAttrs,
        emailVerified: true,
      });

      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          keycloakUserId: kcUserId,
          username,
          lastName: dto.lastName,
          seller: {
            create: {
              address: dto.address,
              businessName: dto.businessName,
              phoneNumber: dto.phoneNumber,
              active: true,
            },
          },
          userRoles: {
            create: [{ role: 'ROLE_SELLER_ADMIN' }, { role: 'ROLE_SELLER' }],
          },
        },
      });

      const emailJobResp =
        await this.emailService.addEmailJob<SellerConfirmationContext>({
          template: 'seller_confirmation',
          contextObj: {
            seller: {
              firstName: dto.firstName,
              email: dto.email,
              password: dto.password,
              profileLink: `http://localhost:3000/profile`,
            },
          },
          recepient: dto.email,
          subject: 'Seller Account Created',
        });

      this.logger.log({
        emailJobSuccess: !!emailJobResp.failedReason,
        failedReason: emailJobResp.failedReason,
      });

      return {
        userId: user.id,
        message: 'Seller account created successfully',
      };
    } catch (err) {
      this.logger.error(
        err?.message || 'Something went wrong creating an affiliate account',
      );
      throw err;
    }
  }

  async createPlatformManager(
    username: string,
    email: string,
    password: string,
  ) {
    try {
      const kcUserId = await this.keycloakUserService.createKeycloakUser({
        userData: {
          email,
          password,
          firstName: 'Super',
          lastName: 'Admin',
        },
        username,
        userGroup: ['SUPER_ADMIN_USER_GROUP'],
        emailVerified: true,
      });

      await this.prismaService.user.create({
        data: {
          email,
          firstName: 'Super',
          lastName: 'Admin',
          keycloakUserId: kcUserId,
          username,
          userRoles: {
            create: [
              { role: 'ROLE_SUPER_ADMIN' },
              { role: 'ROLE_SELLER' },
              { role: 'ROLE_SELLER_ADMIN' },
            ],
          },
        },
      });
    } catch (err) {
      this.logger.error(
        err?.message || 'Unable to create platform manager account',
      );
      throw err;
    }
  }

  async verifyAccount(verifyParams: AffiliateVerifyQueryDto) {
    const { token, email } = verifyParams;
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
        include: { affiliate: true },
      });

      if (user.affiliate.active) {
        return {
          message: 'Email already verified',
          status: 'success',
        };
      }

      const confirmationToken =
        await this.prismaService.confirmationToken.findFirst({
          where: { user: { email } },
        });

      if (!confirmationToken) {
        throw new BadRequestException(
          'Verification link is not correct, request for a new one',
        );
      }

      const tokenExpired = isTokenExpired(confirmationToken);
      if (tokenExpired) {
        throw new BadRequestException(
          'Verification link is expired, request for a new one',
        );
      }

      const tokenIsValid = await verifyConfirmationToken(
        token,
        confirmationToken.token,
      );

      if (!tokenIsValid) {
        throw new BadRequestException(
          'Verification link is invalid, request for a new one',
        );
      }

      await this.keycloakUserService.updateKeycloakUser(user.keycloakUserId, {
        emailVerified: true,
      });
      await this.prismaService.affiliate.update({
        where: { userId: user.id },
        data: { active: true },
      });
      return {
        message: 'Email verified successfully',
        status: 'success',
      };
    } catch (err) {
      this.logger.error(err?.message);
      throw err;
    }
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
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
    if (!user) {
      throw new BadRequestException('Wrong email or password');
    }
    const kcLoginResp = await this.keycloakUserService.loginKeycloakUser(
      user.username,
      dto.password,
    );
    return {
      accessToken: kcLoginResp.access_token,
      refreshToken: kcLoginResp.refresh_token,
      user: transformUserResponse(user),
    };
  }

  async refreshAccessToken(dto: RefreshTokenDto) {
    const { refreshToken } = dto;
    const refreshResp = await this.keycloakUserService.refreshKcAccessToken(
      refreshToken,
    );

    return {
      accessToken: refreshResp.access_token,
      refreshToken: refreshResp.refresh_token,
    };
  }

  async sendResetPasswordToken(
    dto: ResetPasswordDto,
    user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    if (user.email !== dto.email) {
      throw new UnauthorizedException('Unauthorized to perform this action');
    }
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        throw new BadRequestException('User with email does not exist');
      }

      const resetToken = generateConfirmationToken(4);
      const encryptedToken = await encryptToken(
        +this.appConfig.bcryptTokenSalt,
        resetToken,
      );

      await this.prismaService.$transaction([
        this.prismaService.confirmationToken.deleteMany({
          where: { userId: user.id },
        }),
        this.prismaService.confirmationToken.create({
          data: {
            expiresAt: add(new Date(), { minutes: 15 }),
            token: encryptedToken,
            userId: user.id,
          },
        }),
      ]);

      const emailJobResp =
        await this.emailService.addEmailJob<ResetTokenContext>({
          template: 'reset_token',
          contextObj: { resetToken: { code: resetToken } },
          recepient: user.email,
          subject: 'Reset password instructions',
        });
      this.logger.log({
        emailJobSuccess: !!emailJobResp.failedReason,
        failedReason: emailJobResp.failedReason,
      });
      return { message: 'Password reset token has been sent to your email' };
    } catch (err) {
      this.logger.error(err?.message || 'Something went wrong');
      throw err;
    }
  }

  async confirmPasswordReset(
    dto: ResetPasswordConfirmDto,
    user: AuthenticatedUser,
  ) {
    try {
      const token = await this.prismaService.confirmationToken.findFirst({
        where: { userId: user.id },
      });

      if (!token) {
        throw new BadRequestException('Token expired, request for a new one');
      }

      if (isTokenExpired(token)) {
        throw new BadRequestException('Token expired, request for a new one');
      }

      const tokenIsValid = await verifyConfirmationToken(
        dto.token,
        token.token,
      );

      if (!tokenIsValid) {
        throw new BadRequestException(
          'Reset token is invalid, request for a new one',
        );
      }

      await this.keycloakUserService.resetUserPassword(dto.password, user.sub);
      // TO-DO: Send email on successful password reset
      await this.emailService.addEmailJob<PasswordUpdatedContext>({
        template: 'password_changed',
        contextObj: {
          passwordUpdated: {
            firstName: user.given_name,
            userAccount: 'http://localhost:3000/profile',
          },
        },
        recepient: user.email,
        subject: 'Your password has been changed',
      });
      return { message: 'Password reset successful' };
    } catch (err) {
      this.logger.error(err?.message || 'Unable to reset password');
      throw err;
    }
  }

  async resendAffiliateVerificationLink(user: AuthenticatedUser) {
    try {
      await this.prismaService.confirmationToken.deleteMany({
        where: { userId: user.id },
      });

      const confirmationToken = generateConfirmationToken();
      const encryptedToken = await encryptToken(
        +this.appConfig.bcryptTokenSalt,
        confirmationToken,
      );

      await this.prismaService.confirmationToken.create({
        data: {
          expiresAt: add(new Date(), { hours: 24 }),
          token: encryptedToken,
          userId: user.id,
        },
      });

      const emailJobResp =
        await this.emailService.addEmailJob<AffiliateRegisterContext>({
          template: 'affiliate_verification',
          contextObj: {
            affiliateVerification: {
              firstName: user.firstName,
              email: user.email,
              verificationLink: constructVerificationLink(
                this.appConfig.frontendUrl,
                confirmationToken,
                user.email,
              ),
            },
          },
          recepient: user.email,
          subject: 'Verify your Email',
        });
      this.logger.log({
        emailJobSuccess: !!emailJobResp.failedReason,
        failedReason: emailJobResp.failedReason,
      });

      return { userId: user.id, message: 'Verification link has been resent' };
    } catch (err) {
      this.logger.error(
        err?.message || 'Something went wrong with resending verification link',
      );
      throw err;
    }
  }
}
