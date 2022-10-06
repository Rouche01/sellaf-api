import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import {
  AffiliateRegisterDto,
  AffiliateVerifyQueryDto,
  LoginDto,
} from './dtos';
import { LoginResponse } from './interfaces/login_response.interface';
import { AccountService } from './services';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('affiliate/register')
  async register(
    @Body() dto: AffiliateRegisterDto,
  ): Promise<{ userId: number; message: string }> {
    return this.accountService.createAffiliateUser(dto, [
      'AFFILIATE_USER_GROUP',
    ]);
  }

  @Get('/affiliate/verify')
  async verifyAffiliateEmail(@Query() query: AffiliateVerifyQueryDto) {
    console.log(query.token, query.email);
    return this.accountService.verifyAccount(query);
  }

  @Post('/login')
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.accountService.login(dto);
  }
}
