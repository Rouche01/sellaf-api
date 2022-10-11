import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddBankQueryDto {
  @IsString()
  @IsNotEmpty()
  applyTo: 'store' | 'affiliate';

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  id: number;
}
