import { Injectable, PipeTransform } from '@nestjs/common';
import { AuthenticatedUser } from 'src/interfaces';
import { PrismaService } from 'src/prisma';

@Injectable()
export class AuthUserPipe implements PipeTransform {
  prismaService = new PrismaService();
  transform(value: AuthenticatedUser) {
    return this.prismaService.user
      .findFirst({
        where: { keycloakUserId: value.sub },
        include: {
          seller: true,
          affiliate: true,
        },
      })
      .then((user) => {
        return {
          ...value,
          id: user.id,
          ...(user?.seller && { sellerId: user.seller.id }),
          ...(user?.affiliate && { affiliateId: user.affiliate.id }),
        };
      })
      .catch((err) => {
        throw new Error(err?.message);
      });
  }
}
