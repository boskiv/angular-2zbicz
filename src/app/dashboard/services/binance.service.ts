import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { IBinanceWsStream } from '@app/utils/binanceTypes';
import { environment } from '@environments/environment';
import { map, Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export interface IBinanceDepth {
  E: number;
  T: number;
  U: number;
  a: [string, string][];
  b: [string, string][];
  e: string;
  pu: number;
  s: string;
  u: number;
}

// {
//   "e": "24hrTicker",  // Event type
//   "E": 123456789,     // Event time
//   "s": "BTCUSDT",     // Symbol
//   "p": "0.0015",      // Price change
//   "P": "250.00",      // Price change percent
//   "w": "0.0018",      // Weighted average price
//   "c": "0.0025",      // Last price
//   "Q": "10",          // Last quantity
//   "o": "0.0010",      // Open price
//   "h": "0.0025",      // High price
//   "l": "0.0010",      // Low price
//   "v": "10000",       // Total traded base asset volume
//   "q": "18",          // Total traded quote asset volume
//   "O": 0,             // Statistics open time
//   "C": 86400000,      // Statistics close time
//   "F": 0,             // First trade ID
//   "L": 18150,         // Last trade Id
//   "n": 18151          // Total number of trades
// }
export interface IBinancePrice {
  e: string;
  E: number;
  s: string;
  p: string;
  P: string;
  w: string;
  c: string;
  Q: string;
  o: string;
  h: string;
  l: string;
  v: string;
  q: string;
  O: number;
  C: number;
  F: number;
  L: number;
  n: number;
}

export interface IExchangeSymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quoteAssetPrecision: number;
  filters: any[];
}

export interface IExchangeInfo {
  symbols: IExchangeSymbol[];
}

// {
//   "symbol": "BTCUSDT",
//   "priceChange": "-94.99999800",
//   "priceChangePercent": "-95.960",
//   "weightedAvgPrice": "0.29628482",
//   "lastPrice": "4.00000200",
//   "lastQty": "200.00000000",
//   "openPrice": "99.00000000",
//   "highPrice": "100.00000000",
//   "lowPrice": "0.10000000",
//   "volume": "8913.30000000",
//   "quoteVolume": "15.30000000",
//   "openTime": 1499783499040,
//   "closeTime": 1499869899040,
//   "firstId": 28385,   // First tradeId
//   "lastId": 28460,    // Last tradeId
//   "count": 76         // Trade count
// }

export interface ITicker24info {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  lastPrice: string;
  lastQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

// {
//   "e": "24hrTicker",  // Event type
//   "E": 123456789,     // Event time
//   "s": "BTCUSDT",     // Symbol
//   "p": "0.0015",      // Price change
//   "P": "250.00",      // Price change percent
//   "w": "0.0018",      // Weighted average price
//   "c": "0.0025",      // Last price
//   "Q": "10",          // Last quantity
//   "o": "0.0010",      // Open price
//   "h": "0.0025",      // High price
//   "l": "0.0010",      // Low price
//   "v": "10000",       // Total traded base asset volume
//   "q": "18",          // Total traded quote asset volume
//   "O": 0,             // Statistics open time
//   "C": 86400000,      // Statistics close time
//   "F": 0,             // First trade ID
//   "L": 18150,         // Last trade Id
//   "n": 18151          // Total number of trades
// }

export type KlineData = [string | number][];

export interface IMarketStreamTicker {
  e: string;
  E: number;
  s: string;
  p: string;
  P: string;
  w: string;
  c: string;
  Q: string;
  o: string;
  h: string;
  l: string;
  v: string;
  q: string;
  O: number;
  C: number;
  F: number;
  L: number;
  n: number;
}

interface Ticker24 {
  closeTime: number;
  count: number;
  firstId: number;
  highPrice: string;
  lastId: number;
  lastPrice: string;
  lastQty: string;
  lowPrice: string;
  openPrice: string;
  openTime: number;
  priceChange: string;
  priceChangePercent: string;
  quoteVolume: string;
  symbol: string;
  volume: string;
  weightedAvgPrice: string;
}

@Injectable({
  providedIn: 'root',
})
export class BinanceService implements OnDestroy {
  url = 'wss://fstream.binance.com/ws';
  restUrl = 'https://fapi.binance.com';
  assets$ = this.httpClient
    .get<Ticker24[]>(`${this.restUrl}/fapi/v1/ticker/24hr`)
    .pipe(map((data) => data.map((price) => price.symbol)));
  socket: WebSocket;

  constructor(private httpClient: HttpClient) {
    this.socket = new WebSocket(this.url);
  }

  getDepth(symbol: string): WebSocketSubject<IBinanceDepth> {
    return webSocket(`${this.url}/${symbol.toLowerCase()}@depth20`);
  }

  getMarketStream(): WebSocketSubject<IMarketStreamTicker[]> {
    return webSocket(`${this.url}/!ticker@arr`);
  }

  getPremiumIndexStream(symbol: string): WebSocketSubject<IBinanceWsStream> {
    return webSocket(
      `${environment.premiumIndexWS}?streams=p${symbol}@kline_1m`
    );
  }

  getPremiumIndexHistoricalData(symbol: string): Observable<KlineData> {
    return this.httpClient.get<KlineData>(
      `https://www.binance.com/fapi/v1/marketKlines?symbol=p${symbol}&interval=1m&limit=20`
    );
  }

  getSymbol24h(symbol: string) {
    return this.httpClient.get<ITicker24info>(
      `${this.restUrl}/fapi/v1/ticker/24hr?symbol=${symbol}`
    );
  }

  getHistoryPrice({
    symbol,
    interval,
    startTime,
    endTime,
    limit,
  }: {
    symbol: string;
    interval?: string;
    startTime?: string;
    endTime?: string;
    limit?: string;
  }) {
    let params = new HttpParams()
      .set('symbol', symbol)
      .set('interval', interval ?? '1m')
      .set('limit', limit ?? '500');
    if (startTime) {
      params = params.append('startTime', startTime.toString());
    }
    if (endTime) {
      params = params.append('endTime', endTime.toString());
    }
    return this.httpClient.get<KlineData>(`${this.restUrl}/fapi/v1/klines`, {
      params,
    });
  }

  getPriceSubscription(symbol: string): WebSocketSubject<IBinancePrice> {
    return webSocket(`${this.url}/${symbol.toLowerCase()}@ticker`);
  }

  getTickSize(symbol: string) {
    return this.httpClient.get<IExchangeInfo>(
      `https://api.binance.com/api/v3/exchangeInfo`
    );
  }

  ngOnDestroy() {
    this.socket.close();
  }
}
