export interface CreateChargeResponse {
  data: {
    addresses: {
      polygon: string;
      pusdc: string;
      pweth: string;
      ethereum: string;
      usdc: string;
      dai: string;
      apecoin: string;
      shibainu: string;
      tether: string;
      bitcoincash: string;
      dogecoin: string;
      litecoin: string;
      bitcoin: string;
    };
    brand_color: string;
    brand_logo_url: string;
    code: string;
    coinbase_managed_merchant: boolean;
    created_at: string;
    description: string;
    exchange_rates: ExchangeRates;
    expires_at: string;
    fee_rate: number;
    fees_settled: boolean;
    hosted_url: string;
    id: string;
    logo_url: string;
    metadata: Record<string, string>;
    name: string;
    offchain_eligible: boolean;
    organization_name: string;
    payments: Array<any>;
    pricing_type: string;
    pwcb_only: boolean;
    resource: string;
    support_email: string;
    local_exchange_rates: ExchangeRates;
    timeline: Array<Timeline>;
    utxo: boolean;
  };
}

interface Timeline {
  status: string;
  time: string;
}

interface ExchangeRates {
  'ETH-USD': string;
  'BTC-USD': string;
  'LTC-USD': string;
  'DOGE-USD': string;
  'BCH-USD': string;
  'USDC-USD': string;
  'DAI-USD': string;
  'APE-USD': string;
  'SHIB-USD': string;
  'USDT-USD': string;
  'PMATIC-USD': string;
  'PUSDC-USD': string;
  'PWETH-USD': string;
}
