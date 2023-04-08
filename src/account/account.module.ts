import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AccountController } from './account.controller';
import { AccountService, KeycloakUserService } from './services';
import { QueueManagerModule } from 'src/queue_manager';

@Module({
  controllers: [AccountController],
  providers: [AccountService, KeycloakUserService],
  imports: [HttpModule, QueueManagerModule],
  exports: [AccountService, KeycloakUserService],
})
export class AccountModule {}
