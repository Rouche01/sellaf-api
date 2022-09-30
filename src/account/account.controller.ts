import { Body, Controller, Post } from '@nestjs/common';
import { AffiliateRegisterDto } from './dtos';
import { AccountService } from './services';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('register/affiliate')
  async register(@Body() dto: AffiliateRegisterDto): Promise<void> {
    await this.accountService.createKeycloakUser(dto, ['AFFILIATE_USER_GROUP']);
  }
}
