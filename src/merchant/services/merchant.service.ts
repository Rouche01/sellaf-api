import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { FetchMerchantsQueryDto } from '../dto';

@Injectable()
export class MerchantService {
  constructor(private readonly prismaService: PrismaService) {}

  async fetchSellers(params: FetchMerchantsQueryDto) {
    const { limit, skip } = params;
    const [sellers, totalCount] = await this.prismaService.$transaction([
      this.prismaService.seller.findMany({
        ...(limit && { take: limit }),
        ...(skip && { skip }),
        include: { stores: true },
      }),
      this.prismaService.seller.count(),
    ]);
    return { status: 'successful', data: sellers, totalCount };
  }

  async fetchUniqueSellerById(sellerId: number) {
    const seller = await this.prismaService.seller.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      throw new NotFoundException('Unable to find seller');
    }

    return { status: 'successful', data: seller };
  }
}
