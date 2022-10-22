import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { AppLoggerService } from 'src/app_logger';
import {
  AddBeneficiariesResponse,
  FlwBank,
  ResolveAccountResponse,
} from 'src/interfaces';
import { PayWithCardPayload, PayWithCardResponse } from '../interfaces';

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
      throw new InternalServerErrorException(
        err?.message || 'Something went wrong',
      );
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
      throw new InternalServerErrorException(
        err?.message || 'Something went wrong',
      );
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
      throw new InternalServerErrorException(
        err?.message || 'Something went wrong',
      );
    }
  }

  async payWithCard({
    amount,
    cardNumber,
    currency,
    cvv,
    email,
    expiryMonth,
    expiryYear,
    fullName,
    txRef,
  }: PayWithCardPayload) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post<PayWithCardResponse>('/charges?type=card', {
            card_number: cardNumber,
            cvv,
            expiry_month: expiryMonth,
            expiry_year: expiryYear,
            currency,
            amount,
            fullname: fullName,
            email,
            tx_ref: txRef,
          })
          .pipe(),
      );
      return {
        flwRef: response.data.data.flw_ref,
        txRef: response.data.data.tx_ref,
        message: response.data.data.processor_response,
        status: response.data.data.status,
      };
    } catch (err) {
      this.logger.error(err?.response?.data || err?.message);
      throw new InternalServerErrorException(
        err?.message || 'Something went wrong',
      );
    }
  }

  async validateCardPayment(otp: string, flwRef: string) {
    try {
      const response = await lastValueFrom(
        this.httpService
          .post<PayWithCardResponse>('/validate-charge', {
            otp,
            flw_ref: flwRef,
            type: 'card',
          })
          .pipe(),
      );

      return {
        flwRef: response.data.data.flw_ref,
        txRef: response.data.data.tx_ref,
        status: response.data.data.status,
      };
    } catch (err) {
      this.logger.error(err?.response?.data || err?.message);
      throw new InternalServerErrorException(
        err?.message || 'Something went wrong',
      );
    }
  }

  // async payViaBankTransfer() {}
}
