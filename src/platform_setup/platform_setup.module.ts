import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account';
import { PrismaModule } from 'src/prisma';
import { PlatformSetupService } from './services';

@Module({
  imports: [AccountModule, PrismaModule],
  providers: [PlatformSetupService],
  exports: [PlatformSetupService],
})
export class PlatformSetupModule {}
