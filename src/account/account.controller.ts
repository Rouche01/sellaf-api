import { Body, Controller, Post, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public, Roles } from 'nest-keycloak-connect';
import {
  AffiliateRegisterDto,
  AffiliateVerifyQueryDto,
  LoginDto,
  SellerRegisterDto,
} from './dtos';
import { LoginResponse } from './interfaces/login_response.interface';
import { AccountService } from './services';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Public()
  @Post('affiliate/register')
  async register(
    @Body() dto: AffiliateRegisterDto,
  ): Promise<{ userId: number; message: string }> {
    return this.accountService.createAffiliateUser(dto, [
      'AFFILIATE_USER_GROUP',
    ]);
  }

  @Post('seller/register')
  @Roles({ roles: ['realm:super-admin'] })
  async registerSellerAdmin(
    @Body() dto: SellerRegisterDto,
  ): Promise<{ userId: number; message: string }> {
    return this.accountService.createSellerUser(dto, ['STORE_OWNER_GROUP']);
  }

  @Public()
  @Get('/affiliate/verify')
  async verifyAffiliateEmail(
    @Query() query: AffiliateVerifyQueryDto,
    @Res() res: Response,
  ) {
    const { message, status } = await this.accountService.verifyAccount(query);
    // TO-DO: replace the base url to the user dashboard
    res.redirect(`http://localhost:3000?message=${message}&status=${status}`);
  }

  @Public()
  @Post('/login')
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.accountService.login(dto);
  }
}
