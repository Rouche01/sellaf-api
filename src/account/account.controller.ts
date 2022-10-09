import { Body, Controller, Post, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticatedUser, Public, Roles } from 'nest-keycloak-connect';
import { AuthenticatedUser as AuthenticatedUserType } from 'src/interfaces';
import { AuthUserPipe } from 'src/pipes';
import {
  AffiliateRegisterDto,
  AffiliateVerifyQueryDto,
  LoginDto,
  ResetPasswordConfirmDto,
  ResetPasswordDto,
  SellerRegisterDto,
} from './dtos';
import { LoginResponse } from './interfaces/login_response.interface';
import { AccountService } from './services';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('me')
  getMe(@AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType) {
    return {
      sub: user.sub,
      id: user.id,
      email: user.email,
      sellerId: user.sellerId,
      affiliateId: user.affiliateId,
      roles: user.realm_access.roles,
      emailVerified: user.email_verified,
    };
  }

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

  @Post('password/reset/get')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType,
  ) {
    return this.accountService.sendResetPasswordToken(dto, user);
  }

  @Post('password/reset/confirm')
  async resetPasswordConfirm(
    @Body() dto: ResetPasswordConfirmDto,
    @AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType,
  ) {
    return this.accountService.confirmPasswordReset(dto, user);
  }
}
