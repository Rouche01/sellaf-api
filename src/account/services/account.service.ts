import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EmailService } from 'src/email';
import { UserGroups } from 'src/interfaces';
import { PrismaService } from 'src/prisma';
import { generateAffiliateId } from 'src/utils';
import { AffiliateRegisterDto } from '../dtos';
import { KeycloakUserService } from './keycloak-user.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly keycloakUserService: KeycloakUserService,
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createAffiliateUser(
    dto: AffiliateRegisterDto,
    userGroup: Array<UserGroups>,
  ): Promise<{ userId: number; message: string }> {
    const affiliateId = generateAffiliateId();
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
        },
      });

      const emailJobResp = await this.emailService.addEmailJob(
        'Hello World. Testing the mic',
        dto.email,
      );
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
