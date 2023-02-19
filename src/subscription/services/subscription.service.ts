import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { add } from 'date-fns';
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
        data: {
          affiliateId: user.affiliateId,
          transactionId,
          endDate: add(new Date(), { years: 1 }),
        },
      });

      return { paymentLink, status };
    } catch (err) {
      this.logger.error(err?.message || 'Something went wrong');
      throw err;
    }
  }

  async getAffiliateActiveSubscription(user: AuthenticatedUser) {
    const subscription = await this.prismaService.subscription.findFirst({
      where: { active: true, affiliateId: user.affiliateId },
    });

    if (subscription) {
      return subscription;
    } else {
      return null;
    }
  }

  async cancelAffiliateActiveSubscription(
    subId: number,
    user: AuthenticatedUser,
  ) {
    try {
      const subscription = await this.prismaService.subscription.findFirst({
        where: { id: subId, affiliateId: user.affiliateId },
        include: { transaction: { include: { paymentProcessorRef: true } } },
      });

      if (!subscription.active || !subscription.willRenew) {
        throw new BadRequestException("You can't cancel inactive subscription");
      }

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      // pass the transaction id of the payment processor
      await this.paymentService.cancelPaymentSubscription(
        subscription.transaction.paymentProcessorRef.trxId,
      );

      await this.prismaService.subscription.update({
        where: { id: subscription.id },
        data: { willRenew: false },
      });

      return {
        status: 'success',
        message:
          'Subscription cancelled, you will still enjoy your current access until your active subscription expires',
      };
    } catch (err) {
      this.logger.error(
        err?.message || 'Something went wrong cancelling active subscription.',
      );
      throw err;
    }
  }

  // renewSubscription(subId: number, user: AuthenticatedUser) {}
}
