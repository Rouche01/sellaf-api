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
import {
  AuthenticatedUser as AuthenticatedUserType,
  ROLES,
} from 'src/interfaces';
import { AffiliateReferralResponse } from './interfaces';
import {
  EditUserDto,
  EditUserQueryDto,
  GetAffiliateReferralsQueryDto,
  EditUserEmailDto,
  UpdateUserPasswordDto,
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
  async updateUserInfo(
    @Param('id', ParseIntPipe) userId: number,
    @Query() query: EditUserQueryDto,
    @Body() dto: EditUserDto,
  ) {
    if (query.userType === ROLES.AFFILIATE) {
      return this.userService.updateAffiliateUserInfo(dto, userId);
    }
  }

  @Roles({ roles: ['realm:affiliate'] })
  @Patch(':id/email')
  async updateUserEmail(
    @Param('id', ParseIntPipe) userId: number,
    @Query() query: EditUserQueryDto,
    @Body() dto: EditUserEmailDto,
    @AuthenticatedUser(new AuthUserPipe()) user: AuthenticatedUserType,
  ) {
    if (query.userType === ROLES.AFFILIATE) {
      await this.userService.verifyUserEmailAndPassword(
        user,
        dto.password,
        dto.email,
      );
      return this.userService.updateAffiliateUserInfo(
        { emailAddress: dto.email },
        userId,
      );
    }
  }

  @Roles({ roles: ['realm:affiliate'] })
  @Patch(':id/password')
  async updateUserPassword(
    @Body() dto: UpdateUserPasswordDto,
    @Param('id', ParseIntPipe) userId: number,
  ) {
    return this.userService.updateUserPassword(userId, dto);
  }
}
