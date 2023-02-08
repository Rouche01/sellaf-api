import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Currency } from 'src/interfaces';

export class VerifyTransactionQueryDto {
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  expectedAmount: number;

  @IsNotEmpty()
  @IsString()
  transactionCurrency: Currency;

  @IsNotEmpty()
  @IsString()
  transactionRef: string;
}
