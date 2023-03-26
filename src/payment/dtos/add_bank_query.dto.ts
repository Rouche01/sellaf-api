import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddBankQueryDto {
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  storeId?: number;
}
