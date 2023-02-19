import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AccountController } from './account.controller';
import { AccountService, KeycloakUserService } from './services';
import { EmailModule } from 'src/email';

@Module({
  controllers: [AccountController],
  providers: [AccountService, KeycloakUserService],
  imports: [HttpModule, EmailModule],
  exports: [AccountService, KeycloakUserService],
})
export class AccountModule {}
