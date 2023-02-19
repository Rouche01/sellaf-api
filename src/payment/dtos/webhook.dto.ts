import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export enum WebhookEvent {
  'charge.completed',
  'transfer.completed',
  'subscription.cancelled',
}

class WebhookDataDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsString()
  tx_ref: string;
}

export class WebhookDto {
  @IsNotEmpty()
  @IsString()
  event: string;

  @IsNotEmpty()
  @IsObject()
  data: WebhookDataDto;
}
