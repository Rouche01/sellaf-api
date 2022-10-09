import { Module } from '@nestjs/common';
import { StoreService } from './services';
import { StoreController } from './store.controller';

@Module({
  providers: [StoreService],
  controllers: [StoreController],
})
export class StoreModule {}
