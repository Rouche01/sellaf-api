import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppLoggerService } from 'src/app_logger';
import { PrismaService } from 'src/prisma';
import { CreateStoreDto } from '../dtos';

@Injectable()
export class StoreService {
  private readonly logger = new AppLoggerService(StoreService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async createNewStore(
    dto: CreateStoreDto,
    sellerId: number,
  ): Promise<{ storeId: number; message: string }> {
    try {
      const newStore = await this.prismaService.store.create({
        data: { name: dto.name, sellerId },
      });

      return { storeId: newStore.id, message: 'Store created successfully' };
    } catch (err) {
      this.logger.error(
        err?.message || 'Something went wrong with creating new store',
      );
      throw new InternalServerErrorException(
        err?.message || 'Something went wrong with creating new store',
      );
    }
  }
}
