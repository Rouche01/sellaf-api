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
}
