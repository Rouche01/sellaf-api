import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export enum WebhookEvent {
  'charge.completed',
  'transfer.completed',
  'subscription.cancelled',
}

class CustomerDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

class WebhookDataDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  tx_ref: string;

  @IsNotEmpty()
  @IsString()
  amount: number;

  @IsNotEmpty()
  @IsObject()
  customer: CustomerDto;
}

export class WebhookDto {
  @IsNotEmpty()
  @IsString()
  event: string;

  @IsNotEmpty()
  @IsObject()
  data: WebhookDataDto;
}
