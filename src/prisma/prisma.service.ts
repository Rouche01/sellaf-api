import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { applicationConfig } from 'src/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: { url: applicationConfig().databaseUrl },
      },
    });
  }

  cleanDb() {
    return this.$transaction([
      this.confirmationToken.deleteMany(),
      this.affiliate.deleteMany(),
      this.seller.deleteMany(),
      this.userRole.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
