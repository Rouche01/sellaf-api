import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import add from 'date-fns/add';
import compareAsc from 'date-fns/compareAsc';
import { EmailService } from 'src/email';
import { SellerConfirmationContext, UserGroups } from '../interfaces';
import { PrismaService } from 'src/prisma';
import { generateAffiliateId, generateUniqueUsername } from 'src/account/utils';
import {
  AffiliateRegisterDto,
  AffiliateVerifyQueryDto,
  LoginDto,
  SellerRegisterDto,
} from '../dtos';
import { KeycloakUserService } from './keycloak_user.service';
import { applicationConfig } from 'src/config';
import {
  generateConfirmationToken,
  verifyConfirmationToken,
  encryptToken,
} from '../utils';
import { AffiliateRegisterContext } from '../interfaces';
import { AppLoggerService } from 'src/app_logger';
import { LoginResponse } from '../interfaces/login_response.interface';
import { ConfigType } from '@nestjs/config';

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

    const confirmationToken = await generateConfirmationToken();
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
            },
          },
          userRole: {
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

      const verificationLink = encodeURI(
        `http://localhost:4005/api/account/affiliate/verify?token=${confirmationToken}&email=${dto.email}`,
      );

      const emailJobResp =
        await this.emailService.addEmailJob<AffiliateRegisterContext>({
          template: 'affiliate_verification',
          contextObj: {
            affiliateVerification: {
              firstName: dto.firstName,
              email: dto.email,
              verificationLink,
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
      throw new InternalServerErrorException(
        err?.message || 'Something went wrong with creating an affiliate',
      );
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
          userRole: {
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
      throw new InternalServerErrorException(
        err?.message || 'Something went wrong creating an affiliate account',
      );
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
          userRole: {
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
      throw new Error('Unable to create platform manager account');
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
        return {
          message: 'Verification link is not correct, request for a new one',
          status: 'failed',
        };
      }

      // compareInt is -1 when the current date is greater than the token expiry date
      const compareInt = compareAsc(confirmationToken.expiresAt, new Date());

      if (compareInt === -1) {
        return {
          message: 'Verification link is expired, request for a new one',
          status: 'failed',
        };
      }

      const tokenIsValid = await verifyConfirmationToken(
        token,
        confirmationToken.token,
      );

      if (!tokenIsValid) {
        return {
          message: 'Verification link is invalid, request for a new one',
          status: 'failed',
        };
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
      return {
        message:
          err?.message ||
          'Something went wrong with the verification, resend verfication link',
        status: 'failed',
      };
      // throw new InternalServerErrorException(
      //   err?.message || 'Something went wrong with email verification',
      // );
    }
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
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
    };
  }
}
