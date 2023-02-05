import { Controller, Post } from '@nestjs/common';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { AuthenticatedUser as AuthenticatedUserType } from 'src/interfaces';
import { AuthUserPipe } from 'src/pipes';
import { SubscriptionService } from './services';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('create')
  @Roles({ roles: ['realm:affiliate'] })
  createSubscription(
    @AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType,
  ) {
    return this.subscriptionService.createAffiliateSubscription(user);
  }
}
