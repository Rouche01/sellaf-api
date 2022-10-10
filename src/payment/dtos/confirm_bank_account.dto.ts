import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmBankAccountDto {
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  bankCode: string;
}
