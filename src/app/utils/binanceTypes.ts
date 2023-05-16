export type IBinanceKlineArray = [
  number, // Open time
  string, // Open
  string, // High
  string, // Low
  string, // Close
  string, // Volume
  number?, // Close time
  string?, // Quote asset volume
  number?, // Number of trades
  string?, // Taker buy base asset volume
  string?, // Taker buy quote asset volume
  string? // Ignore.
];

export interface IBinanceExchangeInfo {
  timezone: string;
  serverTime: number;
  futuresType: string;
  rateLimits: IBinanceRateLimit[];
  exchangeFilters: any[];
  assets: IBinanceAsset[];
  symbols: IBinanceSymbol[];
}

export interface IBinanceRateLimit {
  rateLimitType: string;
  interval: string;
  intervalNum: number;
  limit: number;
}

export interface IBinanceAsset {
  asset: string;
  marginAvailable: boolean;
  autoAssetExchange: string;
}

export interface IBinanceSymbol {
  symbol: string;
  pair: string;
  contractType: string;
  deliveryDate: number;
  onboardDate: number;
  status: string;
  maintMarginPercent: string;
  requiredMarginPercent: string;
  baseAsset: string;
  quoteAsset: string;
  marginAsset: string;
  pricePrecision: number;
  quantityPrecision: number;
  baseAssetPrecision: number;
  quotePrecision: number;
  underlyingType: string;
  underlyingSubType: string[];
  settlePlan: number;
  triggerProtect: string;
  liquidationFee: string;
  marketTakeBound: string;
  filters: IBinanceFilter[];
  orderTypes: string[];
  timeInForce: string[];
}

export interface IBinanceFilter {
  minPrice?: string;
  maxPrice?: string;
  filterType: string;
  tickSize?: string;
  stepSize?: string;
  maxQty?: string;
  minQty?: string;
  limit?: number;
  notional?: string;
  multiplierDown?: string;
  multiplierUp?: string;
  multiplierDecimal?: string;
}

export interface IBinanceWsStream {
  error: any;
  stream: string;
  data: IBinanceWsKlineEvent;
}

export interface IBinanceWsKlineEvent {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: IBinanceWsKline;
}

export interface IBinanceWsKline {
  error: any;
  t: number; // Kline start time
  T: number; // Kline close time
  s: string; // Symbol
  i: string; // Interval
  f: number; // First trade ID
  L: number; // Last trade ID
  o: string; // Open price
  c: string; // Close price
  h: string; // High price
  l: string; // Low price
  v: string; // Base asset volume
  n: number; // Number of trades
  x: boolean; // Is this kline closed?
  q: string; // Quote asset volume
  V: string; // Taker buy base asset volume
  Q: string; // Taker buy quote asset volume
  B: string; // Ignore
}
