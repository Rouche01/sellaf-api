import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { AppLoggerService } from 'src/app_logger';
import {
  AddBeneficiariesResponse,
  FlwBank,
  ResolveAccountResponse,
} from 'src/interfaces';
import {
  PayWithStandardFlowPayload,
  PayWithStandardFlowResponse,
  VerifyTransactionResponse,
} from '../interfaces';

@Injectable()
export class FlutterwaveService {
  private readonly logger = new AppLoggerService(FlutterwaveService.name);
  constructor(private readonly httpService: HttpService) {}

  async getBanks(countryCode: string): Promise<FlwBank[]> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`/banks/${countryCode}`).pipe(),
      );

      return response.data.data;
    } catch (err) {
      this.logger.error(err?.response?.data || err?.message);
      throw err;
    }
  }

  async resolveBankAccount(accountNumber: string, accountBank: string) {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post<ResolveAccountResponse>('/accounts/resolve', {
            account_number: accountNumber,
            account_bank: accountBank,
            country: 'NG',
          })
          .pipe(),
      );

      return {
        message: 'Bank account confirmed successfully',
        status: 'success',
        accountNumber: response.data.data.account_number,
        accountName: response.data.data.account_name,
      };
    } catch (err) {
      console.log(err?.response);
      this.logger.error(err?.response?.data || err?.message);
      throw err;
    }
  }

  async addTransferBeneficiaries(
    bankCode: string,
    accountNumber: string,
    beneficiaryName: string,
  ) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post<AddBeneficiariesResponse>('/beneficiaries', {
            account_number: accountNumber,
            account_bank: bankCode,
            beneficiary_name: beneficiaryName,
          })
          .pipe(),
      );

      return {
        id: response.data.data.id,
        bankCode: response.data.data.bank_code,
        accountNumber: response.data.data.account_number,
        beneficiaryName: response.data.data.full_name,
        bankName: response.data.data.bank_name,
      };
    } catch (err) {
      this.logger.error(err?.response?.data || err?.message);
      throw err;
    }
  }

  async payWithStandardFlow(paymentPayload: PayWithStandardFlowPayload) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post<PayWithStandardFlowResponse>('/payments', {
            ...paymentPayload,
            customizations: {
              title: 'Sellaf Affiliate Subscription',
              logo: 'https://sellaf.africa/logo.png',
            },
          })
          .pipe(),
      );

      if (!response.data?.data?.link) {
        throw new InternalServerErrorException(
          'Something went wrong with initiating payment, try again',
        );
      }

      return {
        status: response.data.status,
        paymentLink: response.data.data.link,
      };
    } catch (err) {
      this.logger.error(err?.response?.data || err?.message);
      throw err;
    }
  }

  async verifyTransaction(transactionId: string) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .get<VerifyTransactionResponse>(
            `/transactions/${transactionId}/verify`,
          )
          .pipe(),
      );

      return response.data;
    } catch (err) {
      this.logger.error(err?.response?.data || err?.message);
      throw err;
    }
  }

  // async validateCardPayment(otp: string, flwRef: string) {
  //   try {
  //     const response = await lastValueFrom(
  //       this.httpService
  //         .post<PayWithStandardFlowResponse>('/validate-charge', {
  //           otp,
  //           flw_ref: flwRef,
  //           type: 'card',
  //         })
  //         .pipe(),
  //     );

  //     return {
  //       status: response.data.status,
  //       paymentLink: response.data.data.link,
  //     };
  //   } catch (err) {
  //     this.logger.error(err?.response?.data || err?.message);
  //     throw err;
  //   }
  // }

  // async payViaBankTransfer() {}
}
