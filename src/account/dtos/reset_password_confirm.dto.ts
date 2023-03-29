import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordConfirmDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
