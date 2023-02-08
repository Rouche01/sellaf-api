import { Injectable } from '@nestjs/common';
import { SubscriptionPlan, TransactionType } from '@prisma/client';
import { AppLoggerService } from 'src/app_logger';
import { subscriptionPlanConfig } from 'src/constants';
import { AuthenticatedUser } from 'src/interfaces';
import { PaymentService } from 'src/payment';
import { PrismaService } from 'src/prisma';

@Injectable()
export class SubscriptionService {
  private readonly logger = new AppLoggerService(SubscriptionService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async createAffiliateSubscription(user: AuthenticatedUser) {
    try {
      const affiliate = await this.prismaService.affiliate.findUnique({
        where: { id: user.affiliateId },
      });
      const paymentMeta = {
        subscriptionPlan: affiliate.plan,
        affiliateId: affiliate.affiliateCode,
      };

      const { paymentLink, status, transactionId } =
        await this.paymentService.payWithFlutterwave(
          user,
          paymentMeta,
          subscriptionPlanConfig[affiliate.plan].planAmount,
          TransactionType.SUBSCRIPTION,
          SubscriptionPlan.AFFILIATE_DEFAULT,
        );

      await this.prismaService.subscription.create({
        data: { affiliateId: user.affiliateId, transactionId },
      });

      return { paymentLink, status };
    } catch (err) {
      this.logger.error(err?.message || 'Something went wrong');
      throw err;
    }
  }
}
