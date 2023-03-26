import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class DeleteBankDto {
  @IsNotEmpty()
  @IsNumber()
  beneficiaryId: number;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class DeleteBankQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  storeId?: number;
}
