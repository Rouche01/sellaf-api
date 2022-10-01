import { Injectable } from '@nestjs/common';
import { UserGroups } from 'src/interfaces';
import { PrismaService } from 'src/prisma';
import { AffiliateRegisterDto } from '../dtos';
import { KeycloakUserService } from './keycloak-user.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly keycloakUserService: KeycloakUserService,
    private readonly prismaService: PrismaService,
  ) {}

  async createAffiliateUser(
    dto: AffiliateRegisterDto,
    userGroup: Array<UserGroups>,
  ): Promise<{ userId: number; message: string }> {
    await this.keycloakUserService.createKeycloakUser(dto, userGroup);
    const user = await this.prismaService.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        affiliate: {
          create: {
            phoneNumber: dto.phoneNumber,
            affiliateCode: '1234',
          },
        },
        userRole: {
          create: [{ role: 'ROLE_AFFILIATE' }],
        },
      },
    });

    return { userId: user.id, message: 'Affiliate created successfully!' };
  }
}
