import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetAffiliateReferralsQueryDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  skip?: number;
}
