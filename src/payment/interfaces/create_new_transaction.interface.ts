import { ChargeType, TransactionType } from '@prisma/client';

export interface CreateNewTransactionPayload {
  amount: number;
  chargeType: ChargeType;
  referenceCode: string;
  type: TransactionType;
  address?: string;
  coinbaseRef?: string;
  flutterwaveRef?: string;
  initiatedBy: number;
  referredBy?: number;
}
