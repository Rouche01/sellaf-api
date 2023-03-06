import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Currency, PaymentProcessor } from '@prisma/client';
import { applicationConfig } from 'src/config';
import { subscriptionPlanConfig } from 'src/constants';
import { FlutterwaveService } from 'src/flutterwave';
import { PrismaService } from 'src/prisma';
import { CreateNewTransactionPayload } from '../interfaces';
import { generateTransactionRef } from '../utils';
import {
  FetchBanksArgs,
  FetchBanksResponse,
  InitiatePaymentArgs,
  InitiatePaymentResponse,
  PaymentStrategy,
} from './interfaces';

@Injectable()
export class FlutterwaveStrategy implements PaymentStrategy {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly flutterwaveService: FlutterwaveService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
  ) {}

  async initiatePayment(
    args: InitiatePaymentArgs,
  ): Promise<InitiatePaymentResponse> {
    const { amount, paymentMeta, transactionType, user, subscriptionPlan } =
      args;
    const transactionRef = generateTransactionRef();

    let referredById: number;

    if (transactionType === 'SUBSCRIPTION') {
      const affiliateUser = await this.prismaService.affiliate.findUnique({
        where: { id: user.affiliateId },
      });
      referredById = affiliateUser.referredBy;
    }

    const payload = {
      tx_ref: transactionRef,
      amount,
      currency: Currency.NGN,
      redirect_url: `${this.appConfig.frontendUrl}/overview`,
      customer: {
        email: user.email,
        name: `${user.firstName} ${user.family_name}`,
      },
      meta: paymentMeta,
      payment_options: 'card, account, banktransfer, mpesa',
      ...(subscriptionPlan && {
        // revert from test
        payment_plan:
          subscriptionPlanConfig[subscriptionPlan].flutterwavePlanId,
      }),
    };

    const paymentRedirectRes =
      await this.flutterwaveService.payWithStandardFlow(payload);

    // create a new transaction here not tied to any subscription
    const transaction = await this.createNewTransaction({
      amount: +amount,
      chargeType: 'DEBIT',
      initiatedBy: user.id,
      referenceCode: transactionRef,
      type: transactionType,
      referredBy: referredById,
      paymentProcessorType: PaymentProcessor.FLUTTERWAVE,
    });

    return { transactionId: transaction.id, ...paymentRedirectRes };
  }

  async getBankList(args: FetchBanksArgs): Promise<FetchBanksResponse> {
    const { country } = args;
    return this.flutterwaveService.getBanks(country);
  }

  private async createNewTransaction(payload: CreateNewTransactionPayload) {
    const transaction = await this.prismaService.transaction.create({
      data: {
        amount: payload.amount,
        chargeType: payload.chargeType,
        referenceCode: payload.referenceCode,
        type: payload.type,
        address: payload.address,
        initiatedBy: payload.initiatedBy,
        referredBy: payload.referredBy,
        paymentProcessorRef: {
          create: {
            type: payload.paymentProcessorType,
          },
        },
        status: payload.status,
      },
    });

    return transaction;
  }
}
