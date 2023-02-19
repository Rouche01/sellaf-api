import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
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

  @Get('active')
  @Roles({ roles: ['realm:affiliate'] })
  async getActiveSubscription(
    @AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType,
  ) {
    const activeSubscription =
      await this.subscriptionService.getAffiliateActiveSubscription(user);

    return {
      activeSubscription,
      status: 'success',
    };
  }

  @Patch(':id')
  @Roles({ roles: ['realm:affiliate'] })
  async cancelActiveSubscription(
    @Param('id', ParseIntPipe) subscriptionId: number,
    @AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType,
  ) {
    return this.subscriptionService.cancelAffiliateActiveSubscription(
      subscriptionId,
      user,
    );
  }
}
