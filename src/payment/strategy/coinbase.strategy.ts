import { Injectable } from '@nestjs/common';
import { Currency, PaymentProcessor } from '@prisma/client';
import { CoinbaseService } from 'src/coinbase';
import { PrismaService } from 'src/prisma';
import { CreateNewTransactionPayload } from '../interfaces';
import { generateTransactionRef } from '../utils';
import {
  InitiatePaymentArgs,
  InitiatePaymentResponse,
  PaymentStrategy,
} from './interfaces';

@Injectable()
export class CoinbaseStrategy implements PaymentStrategy {
  constructor(
    private readonly coinbaseService: CoinbaseService,
    private readonly prismaService: PrismaService,
  ) {}
  async initiatePayment(
    args: InitiatePaymentArgs,
  ): Promise<InitiatePaymentResponse> {
    const { amount, description, transactionType, user, paymentMeta } = args;
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

    const transaction = await this.createNewTransaction({
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
