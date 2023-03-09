import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Currency, PaymentProcessor } from '@prisma/client';
import { CoinbaseService } from 'src/coinbase';
import { applicationConfig } from 'src/config';
import { PrismaService } from 'src/prisma';
import { generateTransactionRef } from '../utils';
import {
  InitiatePaymentArgs,
  InitiatePaymentResponse,
  PaymentStrategyInterface,
  UseWebhookArgs,
} from './interfaces';

@Injectable()
export class CoinbaseStrategy implements PaymentStrategyInterface {
  constructor(
    private readonly coinbaseService: CoinbaseService,
    private readonly prismaService: PrismaService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
  ) {}
  async initiatePayment(
    args: InitiatePaymentArgs,
  ): Promise<InitiatePaymentResponse> {
    const {
      amount,
      description,
      transactionType,
      user,
      paymentMeta,
      createTransactionRecord,
    } = args;
    const transactionRef = generateTransactionRef();
    const { paymentLink, status } = await this.coinbaseService.createCharge({
      // hardcoding this just for testing
      amount: '500',
      currency: Currency.NGN,
      description,
      name: 'Sellaf Africa',
      referenceCode: transactionRef,
      paymentMetadata: paymentMeta,
    });

    let referredById: number;

    if (transactionType === 'SUBSCRIPTION') {
      const affiliateUser = await this.prismaService.affiliate.findUnique({
        where: { id: user.affiliateId },
      });
      referredById = affiliateUser.referredBy;
    }

    const transaction = await createTransactionRecord({
      amount: +amount,
      chargeType: 'DEBIT',
      initiatedBy: user.id,
      referenceCode: transactionRef,
      type: transactionType,
      referredBy: referredById,
      paymentProcessorType: PaymentProcessor.COINBASE,
    });

    return {
      paymentLink,
      status,
      transactionId: transaction.id,
    };
  }

  async useWebhook(args: UseWebhookArgs): Promise<void> {
    const { webhookSignature } = args;
    if (
      !webhookSignature ||
      webhookSignature !== this.appConfig.coinbase.webhookSecretHash
    ) {
      throw new ForbiddenException();
    }
    console.log('coinbase webhook');
    return;
  }
}
