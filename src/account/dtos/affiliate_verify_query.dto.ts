import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AffiliateVerifyQueryDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
