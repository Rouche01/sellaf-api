import { WebhookDto } from 'src/payment/dtos';
import {
  OnFailedPaymentArgs,
  OnSuccessfulPaymentArgs,
} from 'src/payment/interfaces';

export interface UseWebhookArgs {
  webhookDto: WebhookDto;
  webhookSignature: string;
  onSuccessfulPayment: (args: OnSuccessfulPaymentArgs) => Promise<void>;
  onFailedPayment: (args: OnFailedPaymentArgs) => Promise<void>;
}
