export interface ResolveAccountResponse {
  status: string;
  message: string;
  data: {
    account_number: string;
    account_name: string;
  };
}
