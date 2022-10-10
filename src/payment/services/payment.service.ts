import { Injectable } from '@nestjs/common';
import { FlutterwaveService } from 'src/flutterwave';
import { FlwBank } from 'src/interfaces';
import { ConfirmBankAccountDto } from '../dtos';

@Injectable()
export class PaymentService {
  constructor(private readonly flutterwaveService: FlutterwaveService) {}

  async getBankList(): Promise<FlwBank[]> {
    return this.flutterwaveService.getBanks('NG');
  }

  async confirmAccountNumber(dto: ConfirmBankAccountDto) {
    return this.flutterwaveService.resolveBankAccount(
      dto.accountNumber,
      dto.bankCode,
    );
  }
}
