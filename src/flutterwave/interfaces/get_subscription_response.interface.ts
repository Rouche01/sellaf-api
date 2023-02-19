export interface FlwPaymentSubscription {
  id: number;
  amount: number;
  customer: {
    id: number;
    customer_email: string;
  };
  plan: number;
  status: string;
  created_at: string;
}

export interface GetSubscriptionResponseInterface {
  status: string;
  message: string;
  meta: {
    page_info: {
      total: number;
      current_page: number;
      total_pages: number;
    };
  };
  data: FlwPaymentSubscription[];
}
