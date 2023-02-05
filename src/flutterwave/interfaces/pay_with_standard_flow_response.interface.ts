export interface PayWithStandardFlowResponse {
  status: string;
  message: string;
  data: {
    link: string;
  };
}
