import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async fetchAffiliateReferredUsers(affiliateId: number) {
    const affiliate = await this.prismaService.affiliate.findUnique({
      where: { id: affiliateId },
      include: { referredUsers: true },
    });

    return affiliate.referredUsers;
  }
}
