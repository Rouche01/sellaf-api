export interface ResolveAccountNumberArgs {
  accountNumber: string;
  bankCode: string;
}

export interface ResolveAccountNumberResponse {
  message: string;
  status: string;
  accountNumber: string;
  accountName: string;
}
