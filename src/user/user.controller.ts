import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { AuthUserPipe } from 'src/pipes';
import { UserService } from './services';
import { AuthenticatedUser as AuthenticatedUserType } from 'src/interfaces';
import { AffiliateReferralResponse } from './interfaces';
import {
  EditUserDto,
  EditUserQueryDto,
  GetAffiliateReferralsQueryDto,
} from './dtos';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles({ roles: ['realm:affiliate'] })
  @Get('affiliate/referrals')
  async getAffiliateReferrals(
    @AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType,
    @Query() query: GetAffiliateReferralsQueryDto,
  ): Promise<AffiliateReferralResponse> {
    return this.userService.fetchAffiliateReferredUsers(
      user.affiliateId,
      query,
    );
  }

  @Get('me')
  getMe(@AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType) {
    return this.userService.getUser(user.id);
  }

  @Roles({ roles: ['realm:affiliate'] })
  @Patch(':id')
  async editUserInfo(
    @Param('id', ParseIntPipe) userId: number,
    @Query() query: EditUserQueryDto,
    @Body() dto: EditUserDto,
  ) {
    if (query.userType === 'affiliate') {
      this.userService.updateAffiliateUserInfo(dto, userId);
    }
    return 'edit user';
  }
}
