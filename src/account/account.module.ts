import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AccountController } from './account.controller';
import { AccountService } from './services';

@Module({
  controllers: [AccountController],
  providers: [AccountService],
  imports: [HttpModule],
})
export class AccountModule {}
