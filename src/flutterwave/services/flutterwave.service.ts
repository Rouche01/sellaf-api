import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { AppLoggerService } from 'src/app_logger';
import { FlwBank, ResolveAccountResponse } from 'src/interfaces';

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
}
