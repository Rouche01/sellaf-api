import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  Res,
  Inject,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Response } from 'express';
import { AuthenticatedUser, Public, Roles } from 'nest-keycloak-connect';
import { applicationConfig } from 'src/config';
import { AuthenticatedUser as AuthenticatedUserType } from 'src/interfaces';
import { AuthUserPipe } from 'src/pipes';
import {
  AffiliateRegisterDto,
  AffiliateVerifyQueryDto,
  LoginDto,
  LoginQueryDto,
  RefreshTokenDto,
  ResetPasswordConfirmDto,
  ResetPasswordDto,
  SellerRegisterDto,
} from './dtos';
import { AccountService } from './services';
import { setAccessTokenCookie, setRefreshTokenCookie } from './utils';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
  ) {}

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

  @Post('/affiliate/verification-resend')
  @Roles({ roles: ['realm:affiliate'] })
  async resendAffiliateVerificationEmail(
    @AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType,
  ): Promise<{ userId: number; message: string }> {
    return this.accountService.resendAffiliateVerificationLink(user);
  }

  @Public()
  @Get('/affiliate/verify')
  async verifyAffiliateEmail(@Query() query: AffiliateVerifyQueryDto) {
    const { message, status } = await this.accountService.verifyAccount(query);
    // TO-DO: replace the base url to the user dashboard
    return { message, status };
  }

  @Public()
  @Post('/login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @Query() query: LoginQueryDto,
  ): Promise<{ message: string }> {
    const { accessToken, refreshToken, user } = await this.accountService.login(
      dto,
    );

    setAccessTokenCookie(response, accessToken, this.appConfig.appEnvironment);
    setRefreshTokenCookie(
      response,
      refreshToken,
      this.appConfig.appEnvironment,
    );

    return {
      message: 'User logged in successfully',
      ...(query.include === 'user' && { user }),
    };
  }

  @Public()
  @Post('/refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const { accessToken, refreshToken } =
      await this.accountService.refreshAccessToken(dto);

    return { accessToken, refreshToken };
  }

  @Public()
  @Post('password/reset/get')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.accountService.sendResetPasswordToken(dto);
  }

  @Public()
  @Post('password/reset/confirm')
  async resetPasswordConfirm(@Body() dto: ResetPasswordConfirmDto) {
    return this.accountService.confirmPasswordReset(dto);
  }
}
