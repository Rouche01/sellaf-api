import { IsNotEmpty, IsString } from 'class-validator';

export class AddBankDto {
  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  beneficiaryName: string;
}
