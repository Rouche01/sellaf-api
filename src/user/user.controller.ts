import { Controller, Get } from '@nestjs/common';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { AuthUserPipe } from 'src/pipes';
import { UserService } from './services';
import { AuthenticatedUser as AuthenticatedUserType } from 'src/interfaces';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles({ roles: ['realm:affiliate'] })
  @Get('affiliate/referrals')
  async getAffiliateReferrals(
    @AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType,
  ) {
    const referredUsers = await this.userService.fetchAffiliateReferredUsers(
      user.affiliateId,
    );
    return referredUsers;
  }
}
