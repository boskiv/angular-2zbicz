import { BINANCE_RESOLUTION_MAP } from '@app/utils/v2/config';
import { Bar, ResolutionString } from '@assets/charting_library';
import { environment, klineDomain } from '@environments/environment';

export interface IExchangeInfo {
  timezone: string;
  serverTime: number;
  futuresType: string;
  rateLimits: IRateLimit[];
  exchangeFilters: any[];
  assets: IAsset[];
  symbols: ISymbol[];
}

export interface IRateLimit {
  rateLimitType: string;
  interval: string;
  intervalNum: number;
  limit: number;
}

export interface IAsset {
  asset: string;
  marginAvailable: boolean;
  autoAssetExchange: string;
}

export interface ISymbol {
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
  filters: IFilter[];
  orderTypes: string[];
  timeInForce: string[];
}

export interface IFilter {
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

export async function getBinanceSymbols(): Promise<ISymbol[]> {
  const response = await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo');
  const { symbols } = await response.json();
  return symbols;
}

export async function getSentimentsSymbols(
  binanceSymbols: ISymbol[]
): Promise<ISymbol[]> {
  return binanceSymbols.map((bs) => {
    let ss = { ...bs };
    ss.symbol =
      ss.symbol.split('USDT')[0] + '#SANTIMENTS_SOCIAL_DOMINANCE_TOTAL';
    return ss;
  });
}

export async function getManipulationIndicatorSymbols(
  binanceSymbols: ISymbol[]
): Promise<ISymbol[]> {
  return binanceSymbols.map((bs) => {
    let ss = { ...bs };
    ss.symbol = ss.symbol.split('USDT')[0] + '#SF_MANIPULATION_MONITOR';
    return ss;
  });
}

export async function getOpenInterestIndicatorSymbols(
  binanceSymbols: ISymbol[]
): Promise<ISymbol[]> {
  return binanceSymbols.map((bs) => {
    let ss = { ...bs };
    ss.symbol = ss.symbol.split('USDT')[0] + '#SF_OPEN_INTEREST';
    return ss;
  });
}

export async function fetchBinanceBars(
  symbol: string,
  from: number,
  to: number,
  resolution: string,
  limit: number = 500
): Promise<Bar[]> {
  const interval = BINANCE_RESOLUTION_MAP[resolution];
  const url = `https://${klineDomain}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&startTime=${
    from * 1000
  }&endTime=${to * 1000}&limit=${limit}`;
  const response = await fetch(url);
  const data = await response.json();
  let bars: Bar[] = [];
  data.forEach((d: any) => {
    bars.push({
      time: d[0],
      open: Number(d[1]),
      high: Number(d[2]),
      low: Number(d[3]),
      close: Number(d[4]),
      volume: Number(d[5]),
    });
  });
  // remove last bar if it is not complete
  return bars;
}

// map tag to slug
const TAG_METRIC_MAP = {
  SANTIMENTS_SOCIAL_DOMINANCE_TOTAL: 'social_dominance_total',
  SANTIMENTS_SOCIAL_VOLUME_TOTAL: 'social_volume_total',
};

export async function fetchSantimentBars(
  symbol: string,
  from: number,
  to: number,
  resolution: string
): Promise<Bar[]> {
  const interval = BINANCE_RESOLUTION_MAP[resolution];
  const tag = symbol.split('#')[1];
  const metric = TAG_METRIC_MAP[tag] || '';
  const asset = symbol.split('#')[0].toLowerCase();
  console.log('fetchSantimentBars', asset, tag, metric);
  const url = `${
    environment.santimentsApiURL
  }?asset=${asset}&metric=${metric}&startTime=${from * 1000}&endTime=${
    to * 1000
  }`;
  const response = await fetch(url);
  console.log('fetchSantimentBars', url, response);
  const data = await response.json();
  console.log('fetchSantimentBars', data);
  if (!data || !data.length) {
    return [];
  }
  let bars: Bar[] = [];
  data.forEach((d: any) => {
    bars.push({
      time: new Date(d.datetime).getTime(),
      open: Number(d.value),
      high: 0,
      low: 0,
      close: Number(d.value),
    });
  });
  // remove last bar if it is not complete
  return bars;
}

export async function fetchManipulationBars(
  name: string,
  from: number,
  to: number,
  resolution: ResolutionString
) {
  let interval = BINANCE_RESOLUTION_MAP[resolution];

  if (!interval.endsWith('1m') && !interval.endsWith('5m')) {
    console.log(
      'fetchOpenInterestBars',
      'resolution not supported',
      resolution
    );
    return [];
  }

  const symbol = name.split('#')[0] + 'USDT';
  console.log('fetchManipulationBars', name, from, to, resolution);
  const url = `${
    environment.manipulationApiURL
  }?symbol=${symbol}&timeFrame=${interval}&startTime=${from * 1000}&endTime=${
    to * 1000
  }`;
  console.log('fetchManipulationBars', url);
  const response = await fetch(url);
  const data = await response.json();
  console.log('fetchManipulationBars', data);
  if (data && data.length) {
    return data.map((d: any) => {
      return {
        time: d.timestamp,
        open: Number(d.open),
        high: Number(d.high),
        low: Number(d.low),
        close: Number(d.close),
        volume: Number(0),
      };
    });
  }

  return [];
}

export async function fetchOpenInterestBars(
  name: string,
  from: number,
  to: number,
  resolution: ResolutionString
) {
  let interval = BINANCE_RESOLUTION_MAP[resolution];

  if (!interval.endsWith('1m') && !interval.endsWith('5m')) {
    console.log(
      'fetchOpenInterestBars',
      'resolution not supported',
      resolution
    );
    return [];
  }

  const symbol = name.split('#')[0] + 'USDT';
  const url = `${
    environment.openInterestApiURL
  }?symbol=${symbol}&timeFrame=${interval}&startTime=${from * 1000}&endTime=${
    to * 1000
  }`;
  const response = await fetch(url);
  const data = await response.json();
  if (data && data.length) {
    return data.map((d: any) => {
      return {
        time: d.timestamp,
        open: Number(d.open),
        high: Number(d.high),
        low: Number(d.low),
        close: Number(d.close),
        volume: Number(0),
      };
    });
  }
}

export interface IProject {
  name: string;
  ticker: string;
  slug: string;
}

export async function getAllSantimentProjects(): Promise<IProject[]> {
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
          {
            allProjects {
              name
              ticker
              slug
            }
          }
        `,
      variables: {},
    }),
  };
  const url = `https://api.santiment.net/graphql`;
  const response = await fetch(url, init);
  const data = await response.json();
  return data.data.allProjects;
}

export const fillBarGaps = (bars: Bar[]) => {
  bars.forEach((bar, i) => {
    if (bars[i + 1]) {
      bar.close = bars[i + 1].open;
    }
  });
};
