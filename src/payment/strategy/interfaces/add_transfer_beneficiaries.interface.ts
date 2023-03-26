export interface AddTransferBeneficiariesArgs {
  bankCode: string;
  accountNumber: string;
  beneficiaryName: string;
}

export interface AddTransferBeneficiariesResponse {
  id: number;
  bankCode: string;
  accountNumber: string;
  beneficiaryName: string;
  bankName: string;
}
