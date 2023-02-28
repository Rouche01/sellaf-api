import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { add } from 'date-fns';
import { SubscriptionPlan, TransactionType } from '@prisma/client';
import { AppLoggerService } from 'src/app_logger';
import {
  RENEW_SUBSCRIPTION_QUEUE,
  subscriptionPlanConfig,
} from 'src/constants';
import { AuthenticatedUser } from 'src/interfaces';
import { PaymentService } from 'src/payment';
import { PrismaService } from 'src/prisma';
import { AddRenewSubscriptionJobData } from '../interfaces';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { BullBoardService } from 'src/bull_board';
import { getDifferenceInMsFromNow } from '../../utils';

@Injectable()
export class SubscriptionService {
  private readonly logger = new AppLoggerService(SubscriptionService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
    @InjectQueue(RENEW_SUBSCRIPTION_QUEUE)
    private readonly renewSubscriptionQueue: Queue<AddRenewSubscriptionJobData>,
    private readonly bullBoardService: BullBoardService,
  ) {
    this.bullBoardService.addToQueuePool(this.renewSubscriptionQueue);
  }

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
        await this.paymentService.handlePayment({
          initiatePaymentArgs: {
            user,
            paymentMeta,
            amount: subscriptionPlanConfig[affiliate.plan].planAmount,
            transactionType: TransactionType.SUBSCRIPTION,
            subscriptionPlan: SubscriptionPlan.AFFILIATE_DEFAULT,
          },
          paymentProcessor: 'flutterwave',
        });

      const existingSubscription =
        await this.prismaService.subscription.findUnique({
          where: { affiliateId: user.affiliateId },
        });

      if (existingSubscription) {
        await this.prismaService.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            startDate: new Date(),
            endDate: add(new Date(), { years: 1 }),
            transactions: {
              connect: {
                id: transactionId,
              },
            },
            activeTransactionId: transactionId,
          },
        });
      } else {
        // create the subscription record here and connect the transaction
        // as transaction history and as the transaction for the active subscription
        await this.prismaService.subscription.create({
          data: {
            affiliateId: user.affiliateId,
            endDate: add(new Date(), { years: 1 }),
            transactions: {
              connect: {
                id: transactionId,
              },
            },
            activeTransactionId: transactionId,
          },
        });
      }

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
      const subscription = await this.fetchSubscriptionWithId(subId, user);

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      if (!subscription.active || !subscription.willRenew) {
        throw new BadRequestException("You can't cancel inactive subscription");
      }

      // pass the transaction id of the payment processor for the active transaction
      const paymentSubscription =
        await this.paymentService.getPaymentSubscription(
          subscription.activeTransaction.paymentProcessorRef.trxId,
        );

      if (paymentSubscription.status === 'cancelled') {
        const renewJob = await this.bullBoardService.getQueueJob(
          subId.toString(),
          this.renewSubscriptionQueue,
        );
        if (renewJob) {
          await this.bullBoardService.removeQueueJob(
            subId.toString(),
            this.renewSubscriptionQueue,
          );
        }
      } else {
        await this.paymentService.cancelPaymentSubscription(
          paymentSubscription,
        );
      }

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

  async renewSubscription(subId: number, user: AuthenticatedUser) {
    try {
      const subscription = await this.fetchSubscriptionWithId(subId, user);

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      if (subscription.willRenew) {
        throw new BadRequestException('This subscription is renewed already!');
      }

      await this.addRenewSubscriptionJob(
        { user },
        subscription.endDate,
        subId.toString(),
      );

      await this.prismaService.subscription.update({
        where: { id: subId },
        data: { willRenew: true },
      });

      return {
        status: 'success',
        message:
          'Successful! Your subscription will renew when the current subscription expires.',
      };
    } catch (err) {
      this.logger.error(
        err?.message || 'Something went wrong renewing subscription.',
      );
      throw err;
    }
  }

  async deactivateSubscription(subId: number) {
    await this.prismaService.subscription.update({
      where: { id: subId },
      data: { active: false, activeTransactionId: null },
    });
  }

  private async fetchSubscriptionWithId(
    subId: number,
    user: AuthenticatedUser,
  ) {
    return this.prismaService.subscription.findFirst({
      where: { id: subId, affiliateId: user.affiliateId },
      include: {
        activeTransaction: { include: { paymentProcessorRef: true } },
      },
    });
  }

  private async addRenewSubscriptionJob(
    addRenewJobData: AddRenewSubscriptionJobData,
    renewDate: Date,
    jobId: string,
  ): Promise<Job<AddRenewSubscriptionJobData>> {
    return this.renewSubscriptionQueue.add(
      `add renew subscription job - ${jobId}`,
      addRenewJobData,
      {
        attempts: 5,
        delay: getDifferenceInMsFromNow(renewDate),
        jobId,
      },
    );
  }
}
