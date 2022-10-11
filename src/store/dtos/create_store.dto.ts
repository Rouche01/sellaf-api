import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Country, Currency } from 'src/interfaces';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  currency?: Currency;

  @IsString()
  @IsOptional()
  country?: Country;
}
