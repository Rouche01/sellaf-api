import {
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

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

export class WebhookDataDto {
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

class CoinbaseWebhookEventMetadata {
  @IsOptional()
  @IsString()
  trx_ref?: string;

  @IsOptional()
  @IsString()
  emailAddress?: string;
}

class CoinbaseWebhookEventData {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsDefined()
  @IsObject()
  metadata: CoinbaseWebhookEventMetadata;
}

class CoinbaseWebhookEvent {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsDefined()
  @IsObject()
  data: CoinbaseWebhookEventData;
}

@ValidatorConstraint({ name: 'string-or-coinbase-event', async: false })
class IsStringOrCoinbaseEvent implements ValidatorConstraintInterface {
  validate(value: any) {
    return (
      (typeof value === 'object' && 'type' in value) ||
      typeof value === 'string'
    );
  }

  defaultMessage(validationArguments: ValidationArguments) {
    return `${validationArguments.targetName} must be string or coinbase event object`;
  }
}

export class WebhookDto {
  @IsDefined()
  @Validate(IsStringOrCoinbaseEvent)
  event: CoinbaseWebhookEvent | string;

  @IsOptional()
  @IsObject()
  data?: WebhookDataDto;
}
