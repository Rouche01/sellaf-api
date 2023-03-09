import { IncomingHttpHeaders } from 'http';

export interface WebhookCustomHeaders extends IncomingHttpHeaders {
  'verif-hash'?: string;
  'x-cc-webhook-signature'?: string;
}
