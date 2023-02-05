import { Controller, Get, Query } from '@nestjs/common';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { AuthUserPipe } from 'src/pipes';
import { UserService } from './services';
import { AuthenticatedUser as AuthenticatedUserType } from 'src/interfaces';
import { AffiliateReferralResponse } from './interfaces';
import { GetAffiliateReferralsQueryDto } from './dtos/get_affiliate_referrals_query.dto';

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
}
