import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Currency } from 'src/interfaces';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  currency: Currency;
}
