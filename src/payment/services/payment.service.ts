import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Currency, SubscriptionPlan } from '@prisma/client';
import { generateTransactionRef } from 'src/account/utils';
import { AppLoggerService } from 'src/app_logger';
import { subscriptionPlanConfig } from 'src/constants';
import { FlutterwaveService } from 'src/flutterwave';
import { AuthenticatedUser, Country, FlwBank } from 'src/interfaces';
import { PrismaService } from 'src/prisma';
import { AddBankDto, AddBankQueryDto, ConfirmBankAccountDto } from '../dtos';

@Injectable()
export class PaymentService {
  private readonly logger = new AppLoggerService(PaymentService.name);
  constructor(
    private readonly flutterwaveService: FlutterwaveService,
    private readonly prismaService: PrismaService,
  ) {}

  async getBankList(country: Country = 'NG'): Promise<FlwBank[]> {
    return this.flutterwaveService.getBanks(country);
  }

  async confirmAccountNumber(dto: ConfirmBankAccountDto) {
    return this.flutterwaveService.resolveBankAccount(
      dto.accountNumber,
      dto.bankCode,
    );
  }

  async addBankAccount(
    dto: AddBankDto,
    query: AddBankQueryDto,
    user: AuthenticatedUser,
  ): Promise<{ status: string; message: string }> {
    const { bankCode, accountNumber, beneficiaryName } = dto;
    const { applyTo, id } = query;
    const beneficiaryResp =
      await this.flutterwaveService.addTransferBeneficiaries(
        bankCode,
        accountNumber,
        beneficiaryName,
      );

    const bankUpdateData = {
      accountNumber: beneficiaryResp.accountNumber,
      bankCode: beneficiaryResp.bankCode,
      bankName: beneficiaryResp.bankName,
      beneficiaryId: beneficiaryResp.id,
    };

    try {
      if (applyTo === 'store') {
        const store = await this.prismaService.store.findFirst({
          where: { id, owner: { id: user.sellerId } },
        });

        if (!store) {
          throw new NotFoundException('Store does not exist');
        }

        await this.prismaService.store.update({
          where: { id },
          data: bankUpdateData,
        });
      }

      if (applyTo === 'affiliate') {
        const affiliate = await this.prismaService.affiliate.findFirst({
          where: { id, user: { id: user.id } },
        });

        if (!affiliate) {
          throw new NotFoundException('Affiliate does not exist');
        }

        await this.prismaService.affiliate.update({
          where: { id },
          data: bankUpdateData,
        });
      }

      return { status: 'success', message: 'Bank account added successfully' };
    } catch (err) {
      this.logger.error(err?.response?.data || err?.message);
      throw new InternalServerErrorException(
        err?.message || 'Something went wrong',
      );
    }
  }

  async payWithFlutterwave(
    user: AuthenticatedUser,
    paymentMeta: Record<string, any>,
    amount: string,
    subscriptionPlan?: SubscriptionPlan,
  ) {
    const transactionRef = generateTransactionRef();

    const payload = {
      tx_ref: transactionRef,
      amount,
      currency: Currency.NGN,
      redirect_url: 'http://localhost:3001/overview',
      customer: {
        email: user.email,
        name: `${user.firstName} ${user.family_name}`,
      },
      meta: paymentMeta,
      payment_options: 'card, account, banktransfer, mpesa',
      ...(subscriptionPlan && {
        payment_plan:
          subscriptionPlanConfig[subscriptionPlan].flutterwavePlanId,
      }),
    };

    return this.flutterwaveService.payWithStandardFlow(payload);
  }
}
