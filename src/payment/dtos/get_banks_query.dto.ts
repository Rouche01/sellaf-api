import { IsOptional, IsString } from 'class-validator';
import { Country } from 'src/interfaces';

export class GetBanksQueryDto {
  @IsString()
  @IsOptional()
  country?: Country;
}
