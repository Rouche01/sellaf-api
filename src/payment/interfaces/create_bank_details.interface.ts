export interface CreateBankDetailsPayload {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  beneficiaryId: number;
  accountName: string;
  storeId?: number;
  affiliateId?: number;
}
