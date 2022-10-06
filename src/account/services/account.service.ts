import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import add from 'date-fns/add';
import compareAsc from 'date-fns/compareAsc';
import { EmailService } from 'src/email';
import { UserGroups } from '../interfaces';
import { PrismaService } from 'src/prisma';
import { generateAffiliateId, generateUniqueUsername } from 'src/account/utils';
import {
  AffiliateRegisterDto,
  AffiliateVerifyQueryDto,
  LoginDto,
} from '../dtos';
import { KeycloakUserService } from './keycloak-user.service';
import { applicationConfig } from 'src/config';
import { generateConfirmationToken, verifyConfirmationToken } from '../utils';
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
    private readonly emailService: EmailService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
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
    const confirmationToken = await generateConfirmationToken(
      +this.appConfig.bcryptTokenSalt,
    );

    const keycloakAttrs = {
      affiliateId: [affiliateId],
      phoneNumber: [dto.phoneNumber],
    };

    await this.keycloakUserService.createKeycloakUser(
      dto,
      username,
      userGroup,
      keycloakAttrs,
    );
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          username,
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
              token: confirmationToken,
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
            firstName: dto.firstName,
            email: dto.email,
            verificationLink,
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
      throw new InternalServerErrorException(
        err?.message || 'Something went wrong with creating an affiliate',
      );
    }
  }

  async verifyAccount(verifyParams: AffiliateVerifyQueryDto) {
    const { token, email } = verifyParams;
    const confirmationToken =
      await this.prismaService.confirmationToken.findFirst({
        where: { user: { email } },
      });

    if (!confirmationToken) {
      throw new BadRequestException(
        'Verification link is not correct, request for a new one',
      );
    }

    // compareInt is -1 when the current date is greater than the token expiry date
    const compareInt = compareAsc(confirmationToken.expiresAt, new Date());

    if (compareInt === -1) {
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
    return 'verify';
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });
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
