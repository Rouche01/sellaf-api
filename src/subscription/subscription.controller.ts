import {
  Body,
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
import { CreateSubscriptionDto } from './dtos';
import { SubscriptionService } from './services';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('create')
  @Roles({ roles: ['realm:affiliate'] })
  createSubscription(
    @AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionService.createAffiliateSubscription(
      user,
      dto.paymentProcessor,
    );
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

  @Patch('renew/:id')
  @Roles({ roles: ['realm:affiliate'] })
  async renewSubscription(
    @Param('id', ParseIntPipe) subscriptionId: number,
    @AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType,
  ) {
    return this.subscriptionService.renewSubscription(subscriptionId, user);
  }
}
