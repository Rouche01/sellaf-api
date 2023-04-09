import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class FetchMerchantsQueryDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  skip?: number;
}
