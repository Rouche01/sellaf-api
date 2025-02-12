import {
  ChargeType,
  PaymentProcessor,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

export interface CreateNewTransactionPayload {
  amount: number;
  chargeType: ChargeType;
  referenceCode: string;
  type: TransactionType;
  address?: string;
  initiatedBy: number;
  referredBy?: number;
  paymentProcessorType: PaymentProcessor;
  status?: TransactionStatus;
}
