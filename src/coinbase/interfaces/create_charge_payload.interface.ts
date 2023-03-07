export interface CreateChargePayload {
  name: string;
  amount: string;
  currency: string;
  description: string;
  referenceCode: string;
  paymentMetadata: Record<string, unknown>;
}
