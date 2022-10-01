import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AccountController } from './account.controller';
import { AccountService, KeycloakUserService } from './services';

@Module({
  controllers: [AccountController],
  providers: [AccountService, KeycloakUserService],
  imports: [HttpModule],
})
export class AccountModule {}
