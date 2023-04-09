import { Module } from '@nestjs/common';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './services';

@Module({
  providers: [MerchantService],
  controllers: [MerchantController],
})
export class MerchantModule {}
