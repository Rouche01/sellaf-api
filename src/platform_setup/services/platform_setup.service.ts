import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AccountService } from 'src/account';
import { applicationConfig } from 'src/config';
import { PrismaService } from 'src/prisma';

@Injectable()
export class PlatformSetupService {
  constructor(
    private readonly accountService: AccountService,
    private readonly prismaService: PrismaService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
  ) {}

  async createPlatformManager() {
    const superAdmin = await this.prismaService.user.findUnique({
      where: { email: this.appConfig.adminEmail },
    });

    if (!superAdmin) {
      await this.accountService.createPlatformManager(
        this.appConfig.adminUsername,
        this.appConfig.adminEmail,
        this.appConfig.adminPassword,
      );
    }
  }
}
