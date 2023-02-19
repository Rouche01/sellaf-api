import { IsNotEmpty, IsString } from 'class-validator';

export class EditUserQueryDto {
  @IsNotEmpty()
  @IsString()
  userType: 'affiliate' | 'seller';
}
