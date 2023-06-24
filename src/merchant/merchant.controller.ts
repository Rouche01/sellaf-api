import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { FetchMerchantsQueryDto } from './dto';
import { MerchantService } from './services';

@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get()
  @Roles({ roles: ['realm:super-admin'] })
  async getSellers(@Query() query: FetchMerchantsQueryDto) {
    return this.merchantService.fetchSellers(query);
  }

  @Get(':id')
  @Roles({ roles: ['realm:super-admin'] })
  async fetchSellerById(@Param('id', ParseIntPipe) sellerId: number) {
    return this.merchantService.fetchUniqueSellerById(sellerId);
  }
}
