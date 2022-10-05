import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import add from 'date-fns/add';
import { EmailService } from 'src/email';
import { UserGroups } from 'src/interfaces';
import { PrismaService } from 'src/prisma';
import { generateAffiliateId } from 'src/account/utils';
import { AffiliateRegisterDto } from '../dtos';
import { KeycloakUserService } from './keycloak-user.service';
import { applicationConfig } from 'src/config';
import { generateConfirmationToken } from '../utils/generate_confirmation_token.util';
import { AffiliateRegisterContext } from '../interfaces';

@Injectable()
export class AccountService {
  private readonly bcryptTokenSalt: string;

  constructor(
    private readonly keycloakUserService: KeycloakUserService,
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {
    this.bcryptTokenSalt = applicationConfig().bcryptTokenSalt;
  }

  async createAffiliateUser(
    dto: AffiliateRegisterDto,
    userGroup: Array<UserGroups>,
  ): Promise<{ userId: number; message: string }> {
    const affiliateId = generateAffiliateId();
    const confirmationToken = await generateConfirmationToken(
      +this.bcryptTokenSalt,
    );
    const keycloakAttrs = {
      affiliateId: [affiliateId],
      phoneNumber: [dto.phoneNumber],
    };

    await this.keycloakUserService.createKeycloakUser(
      dto,
      userGroup,
      keycloakAttrs,
    );
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
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
      console.log(verificationLink);

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
      Logger.log({
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
}
