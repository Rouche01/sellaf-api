import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { AuthenticatedUser as AuthenticateduserType } from 'src/interfaces';
import { AuthUserPipe } from 'src/pipes';
import { CreateStoreDto } from './dtos';
import { StoreService } from './services';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @Roles({ roles: ['realm:seller-admin'] })
  async createStore(
    @Body() dto: CreateStoreDto,
    @AuthenticatedUser(new AuthUserPipe())
    user: AuthenticateduserType,
  ): Promise<{ storeId: number; message: string }> {
    return this.storeService.createNewStore(dto, user.sellerId);
  }
}
