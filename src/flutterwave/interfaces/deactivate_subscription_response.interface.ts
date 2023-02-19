import { FlwPaymentSubscription } from './get_subscription_response.interface';

export interface DeactivateSubscriptionResponse {
  status: string;
  message: string;
  data: FlwPaymentSubscription;
}
