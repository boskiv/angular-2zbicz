import { INewsObject } from '@app/dashboard/services/news.service';
import { ISpike } from '@app/dashboard/services/spike.service';
import { IStopKiller } from '@app/dashboard/services/stopkiller.service';
import {
  Bar,
  ErrorCallback,
  GetMarksCallback,
  HistoryCallback,
  IDatafeedChartApi,
  IDatafeedQuotesApi,
  IExternalDatafeed,
  LibrarySymbolInfo,
  Mark,
  OnReadyCallback,
  PeriodParams,
  QuotesCallback,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
  SymbolResolveExtension,
  TimescaleMark,
  Timezone,
} from '@assets/charting_library';
import { environment } from '@environments/environment';
import Formula from 'fparser';
import { forkJoin, from as rxjsFrom, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { subscribeOnStream, unsubscribeFromStream } from './binanceStream';
import {
  IBinanceExchangeInfo,
  IBinanceKlineArray,
  IBinanceSymbol,
} from './binanceTypes';
import { findLegsName, prepareFormula } from './helpers';

export class BinanceDatafeed
  implements IDatafeedChartApi, IExternalDatafeed, IDatafeedQuotesApi
{
  private readonly klineHost: string;
  private readonly wsHost: string;
  private iBinanceSymbols: IBinanceSymbol[] = [];
  private readonly symbols: Map<string, LibrarySymbolInfo & { legs: any }> =
    new Map();
  private readonly lastBarsCache: Map<string, Bar> = new Map();

  // private readonly isLocal: boolean;

  constructor() {
    this.klineHost = 'https://fapi.binance.com';
    this.wsHost = 'wss://fstream.binance.com';
  }

  getQuotes(
    symbols: string[],
    onDataCallback: QuotesCallback,
    onErrorCallback: (msg: string) => void
  ): void {}

  onReady(callback: OnReadyCallback): void {
    console.log('===== BinanceDatafeed is ready =====');
    this.binanceSymbols()
      .then((symbols) => {
        this.iBinanceSymbols = symbols;
        callback({
          supports_marks: true,
          supports_timescale_marks: true,
          supports_time: true,
          supported_resolutions: [
            '1',
            '3',
            '5',
            '15',
            '30',
            '1h',
            '2h',
            '4h',
            '6h',
            '8h',
            '12h',
            '1D',
            '3D',
            '1W',
            '1M',
          ] as ResolutionString[],
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: SearchSymbolsCallback
  ): void {
    console.log('searchSymbols', userInput);
    userInput = userInput.toUpperCase();

    onResult(
      this.iBinanceSymbols
        .filter((symbol) => {
          return (
            // !(symbol.symbol.indexOf('#') >= 0) &&
            symbol.symbol.indexOf(userInput) >= 0
          );
        })
        .map((symbol) => {
          return {
            symbol: symbol.symbol,
            full_name: symbol.symbol,
            description: symbol.baseAsset + symbol.quoteAsset,
            ticker: symbol.symbol,
            exchange: 'BINANCE',
            type: 'crypto',
          };
        })
    );
  }

  resolveSymbol(
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback,
    extension?: SymbolResolveExtension
  ): void {
    console.log('resolveSymbol', symbolName);
    symbolName = symbolName.replace('BINANCE:', '').replace('BINANCE:', '');
    if (!environment.production) console.log('resolveSymbol', symbolName);
    let symbol = this.iBinanceSymbols.find((s) => s.symbol === symbolName);
    if (!environment.production) console.log('found-#', symbolName);
    if (!environment.production) console.log('found-#', symbol);
    if (symbol) {
      if (!environment.production)
        console.log('resolveSymbol', symbolName, symbol);
      onResolve({
        name: symbol.symbol,
        full_name: symbol.symbol,
        description: symbol.symbol
          .replaceAll('USDT', '')
          .replaceAll('BUSD', ''),
        ticker: symbol.symbol,
        exchange: 'BINANCE',
        type: 'CRYPTO',
        pricescale: 0,
        session: '24x7',
        minmov: 1,
        volume_precision: 1,
        data_status: 'streaming',
        timezone: 'UTC' as Timezone,
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
        has_empty_bars: true,
      } as LibrarySymbolInfo);
    }

    if (findLegsName(symbolName, false).length > 1) {
      this.addPairSymbol(symbolName);
    }

    function priceScale(symbol: string, symbols: IBinanceSymbol[]) {
      console.log('priceScale', symbol);
      const legs = findLegsName(symbolName, true);
      const params: any = {};
      const ar: number[] = [];
      for (const leg of legs) {
        for (const symbol of symbols) {
          if (symbol.symbol === leg) {
            for (const filter of symbol.filters) {
              if (filter.filterType === 'PRICE_FILTER' && filter.tickSize) {
                params[leg] = parseFloat(filter.tickSize);
                ar.push(parseFloat(filter.tickSize));
              }
            }
          }
        }
      }
      return Math.round(1 / Math.min(...ar));
    }
    console.log('this.iBinanceSymbols', this.iBinanceSymbols);
    for (const symbol of this.iBinanceSymbols) {
      if (symbol.symbol == symbolName) {
        setTimeout(() => {
          const sss = {
            name: symbol.symbol,
            full_name: symbol.symbol,
            description: symbol.symbol
              .replaceAll('USDT', '')
              .replaceAll('BUSD', ''),
            ticker: symbol.symbol,
            exchange: 'BINANCE',
            type: 'CRYPTO',
            pricescale: priceScale(symbolName, this.iBinanceSymbols),
            session: '24x7',
            minmov: 1,
            volume_precision: 1,
            data_status: 'streaming',
            timezone: 'UTC' as Timezone,
            has_intraday: true,
            has_daily: true,
            has_weekly_and_monthly: true,
            has_empty_bars: true,
          } as LibrarySymbolInfo;
          console.log('sss', sss);
          onResolve(sss);
        }, 0);
        return;
      }
    }

    onError('not found');
  }

  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError: ErrorCallback
  ): void {
    console.log('getBars', symbolInfo, resolution, periodParams);
    let from = periodParams.from;
    let to = periodParams.to;
    const firstDataRequest = periodParams.firstDataRequest;

    const interval = {
      1: '1m',
      3: '3m',
      5: '5m',
      15: '15m',
      30: '30m',
      60: '1h',
      120: '2h',
      240: '4h',
      360: '6h',
      480: '8h',
      720: '12h',
      '1D': '1d',
      '3D': '3d',
      W: '1w',
      '1W': '1w',
      M: '1M',
      '1M': '1M',
    }[resolution as string];

    if (!interval) {
      onError('Invalid interval');
    }

    let totalKlines: IBinanceKlineArray[] = [];
    let bars: Bar[] = [];
    if (!environment.production)
      console.log('getBars', symbolInfo.name, resolution, periodParams);
    if (symbolInfo.name.indexOf('#') >= 0) {
      if (!environment.production)
        console.log('getbars found #', symbolInfo.name);
      fetch('http://localhost:3000/ogn', {
        // method: 'GET',
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        //   body: JSON.stringify({
        //     query: `
        //   {
        //     getMetric(metric: "social_dominance_total") {
        //       timeseriesData(
        //         slug: "origin-protocol"
        //         from: "2023-03-15T07:00:00Z"
        //         to: "2023-03-17T07:00:00Z"
        //         interval: "1m"
        //       ) {
        //         datetime
        //         value
        //       }
        //     }
        //   }
        // `,
        //     variables: {
        //       now: new Date().toISOString(),
        //     },
        //   }),
      })
        .then((res) => res.json())
        .then((result) => {
          bars = result.data.getMetric.timeseriesData.map((d: any) => {
            if (!environment.production)
              console.log('d', d, new Date(d.datetime).getTime() / 1000);
            return {
              time: new Date(d.datetime).getTime() / 1000,
              open: d.value,
            };
          });
          onResult(
            [],
            {
              noData: false,
            }
            // result.data.getMetric.timeseriesData.map((d: any) => {
            //   if (!environment.production) console.log('d', d, new Date(d.datetime).getTime() / 1000);
            //   return {
            //     time: new Date(d.datetime).getTime() / 1000,
            //     open: d.value,
            //   };
            // })
          );
        });
    }

    const finishKlines = () => {
      if (totalKlines.length === 0) {
        onResult([], { noData: true });
      } else {
        onResult(
          (bars = totalKlines.map((kline) => {
            return {
              time: kline[0],
              open: parseFloat(kline[1]),
              high: parseFloat(kline[2]),
              low: parseFloat(kline[3]),
              close: parseFloat(kline[4]),
              volume: parseFloat(kline[5]),
            } as Bar;
          })),
          {
            noData: false,
          }
        );
      }
      if (firstDataRequest) {
        this.lastBarsCache.set(
          symbolInfo.name + '_' + resolution,
          bars[bars.length - 1]
        );
      }
    };

    const getKlines = (from: number, to: number) => {
      console.log('getKlines', from, to);
      this.binanceKlines(
        symbolInfo.name,
        interval as string,
        String(from),
        String(to),
        500
      )
        .then((klines) => {
          totalKlines = totalKlines.concat(klines);
          if (klines.length == 500) {
            from = klines[klines.length - 1][0] + 1;
            getKlines(from, to);
          } else {
            finishKlines();
          }
        })
        .catch((err) => {
          console.error(err);
          onError('Error get klines');
        });
    };

    from *= 1000;
    to *= 1000;

    getKlines(from, to);
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void
  ): void {
    console.log('subscribeBars', symbolInfo, resolution, listenerGuid);
    const waitForElement = () => {
      if (
        typeof this.lastBarsCache.get(symbolInfo.name + '_' + resolution) !==
        'undefined'
      ) {
        subscribeOnStream(
          symbolInfo,
          resolution,
          onTick,
          listenerGuid,
          onResetCacheNeededCallback,
          this.lastBarsCache.get(symbolInfo.name + '_' + resolution),
          this.wsHost
        );
      } else {
        setTimeout(waitForElement, 1);
      }
    };

    waitForElement();
  }

  unsubscribeBars(listenerGuid: string): void {
    unsubscribeFromStream(listenerGuid);
  }

  subscribeQuotes(
    symbols: string[],
    fastSymbols: string[],
    onRealtimeCallback: QuotesCallback,
    listenerGUID: string
  ): void {}

  unsubscribeQuotes(listenerGUID: string): void {}

  getServerTime(callback: (arg0: number) => void) {
    this.binanceServerTime()
      .then((time) => {
        callback(Math.floor(time / 1000));
      })
      .catch((err) => {
        console.error(err);
      });
  }

  addPairSymbol(symbolName: string): void {
    console.log('addPairSymbol', symbolName);
    const legList = findLegsName(symbolName, false);

    const base = this.iBinanceSymbols.filter((s) => s.symbol === legList[0])[0];
    const leg = JSON.parse(JSON.stringify(base));
    console.log('leg', leg);
    leg.symbol = symbolName;
    leg.pair = symbolName;
    this.iBinanceSymbols = [...this.iBinanceSymbols, leg];
    this.symbols.set(symbolName, {
      name: symbolName,
      full_name: symbolName,
      description: symbolName.replaceAll('USDT', '').replaceAll('BUSD', ''),
      exchange: 'BINANCE',
      type: 'spread',
      session: '24x7',
      pricescale: this.priceScaleSymbols(symbolName, this.iBinanceSymbols),
      minmov: 1,
      volume_precision: 1,
      data_status: 'streaming',
      timezone: 'UTC' as Timezone,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      has_empty_bars: true,
      format: 'price',
      listed_exchange: '',
      legs: legList,
      supported_resolutions: [
        '1',
        '3',
        '5',
        '15',
        '30',
        '1h',
        '2h',
        '4h',
        '6h',
        '8h',
        '12h',
        '1D',
        '3D',
        '1W',
        '1M',
      ] as ResolutionString[],
    });
  }

  binanceServerTime(): Promise<number> {
    return fetch(this.klineHost + '/fapi/v1/time')
      .then((res) => {
        return res.json();
      })
      .then((json: { serverTime: number }) => {
        return json.serverTime;
      });
  }

  priceScaleSymbol(symbol: IBinanceSymbol): number {
    for (const filter of symbol.filters) {
      if (filter.filterType === 'PRICE_FILTER' && filter.tickSize) {
        return Math.round(1 / parseFloat(filter.tickSize));
      }
    }
    return 1;
  }

  priceScaleSymbols(symbol: string, symbols: IBinanceSymbol[]): number {
    console.log('priceScaleSymbols', symbol, symbols);
    const legs = findLegsName(symbol, true);
    const params: any = {};
    const ar: number[] = [];
    for (const leg of legs) {
      for (const symbol of symbols) {
        if (symbol.symbol === leg) {
          for (const filter of symbol.filters) {
            if (filter.filterType === 'PRICE_FILTER' && filter.tickSize) {
              params[leg] = parseFloat(filter.tickSize);
              ar.push(parseFloat(filter.tickSize));
            }
          }
        }
      }
    }
    return Math.round(1 / Math.min(...ar));
  }

  makeDate(timestamp: number): Date;
  makeDate(m: number, d: number, y: number): Date;
  makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
    if (d !== undefined && y !== undefined) {
      return new Date(y, mOrTimestamp, d);
    } else {
      return new Date(mOrTimestamp);
    }
  }

  binanceSymbols(): Promise<IBinanceSymbol[]> {
    console.log('binanceSymbols');
    return fetch(this.klineHost + '/fapi/v1/exchangeInfo')
      .then((res) => {
        return res.json();
      })
      .then((exchangeInfo: IBinanceExchangeInfo) => {
        exchangeInfo.symbols.map((symbol) => {
          this.symbols.set(symbol.symbol, {
            name: symbol.symbol,
            full_name: symbol.symbol,
            description: symbol.symbol
              .replaceAll('USDT', '')
              .replaceAll('BUSD', ''),
            exchange: 'BINANCE',
            type: 'crypto',
            session: '24x7',
            pricescale: this.priceScaleSymbol(symbol),
            minmov: 1,
            volume_precision: 1,
            data_status: 'streaming',
            timezone: 'UTC' as Timezone,
            has_intraday: true,
            has_daily: true,
            has_weekly_and_monthly: true,
            has_empty_bars: true,
            format: 'price',
            listed_exchange: '',
            legs: [symbol.symbol],
            supported_resolutions: [
              '1',
              '3',
              '5',
              '15',
              '30',
              '1h',
              '2h',
              '4h',
              '6h',
              '8h',
              '12h',
              '1D',
              '3D',
              '1W',
              '1M',
            ] as ResolutionString[],
          });
        });
        return exchangeInfo.symbols;
      });
  }

  async binanceKlines(
    symbol: string,
    interval: string,
    startTime: string,
    endTime: string,
    limit: number
  ): Promise<IBinanceKlineArray[]> {
    console.log('binanceKlines', symbol, interval, startTime, endTime, limit);
    const legs = findLegsName(symbol, true);
    const results = new Map<string, IBinanceKlineArray[]>();

    const promises = legs.map(async (leg) => {
      return fetch(
        `${this.klineHost}/fapi/v1/klines?symbol=${encodeURIComponent(
          leg.toUpperCase()
        )}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=${limit}`
      )
        .then<IBinanceKlineArray[]>((res: Response) =>
          res.ok ? res.json() : Promise.resolve()
        )
        .then((kline) => {
          results.set(leg, kline);
        })
        .catch((err) => console.error(err));
    });

    await Promise.all(promises);

    const calculator = new Formula(prepareFormula(symbol));

    const kData = [] as IBinanceKlineArray[];

    let minLength = Infinity;
    results.forEach((c) => {
      minLength = Math.min(c.length, minLength);
    });
    results.forEach((value, key) => {
      value = value.slice(-minLength);
      results.set(key, value);
    });

    const entry = results.get(legs[0]);
    if (minLength > 0 && entry) {
      for (let i = 0; i < entry.length; i++) {
        const paramsOpen: any = {};
        const paramsHigh: any = {};
        const paramsLow: any = {};
        const paramsClose: any = {};
        let volume = 0;
        for (const symbol of legs) {
          const kl = results.get(symbol);
          if (kl) {
            paramsOpen[symbol] = Number(kl[i][1]);
            paramsHigh[symbol] = Number(kl[i][2]);
            paramsLow[symbol] = Number(kl[i][3]);
            paramsClose[symbol] = Number(kl[i][4]);
            if (legs.length == 1) {
              volume += Number(kl[i][5]);
            } else {
              volume += (Number(kl[i][5]) + Number(kl[i][7])) / 2;
            }
          }
        }
        const time = entry[i][0];
        const open = calculator.evaluate(paramsOpen);
        const high = calculator.evaluate(paramsHigh);
        const low = calculator.evaluate(paramsLow);
        const close = calculator.evaluate(paramsClose);

        kData.push([
          time,
          String(open),
          String(open >= close ? Math.max(high, open) : Math.max(high, close)),
          String(open >= close ? Math.min(low, close) : Math.min(low, open)),
          String(close),
          String(volume),
        ]);
      }
    }

    return kData;
  }

  getMarks = (
    symbolInfo: LibrarySymbolInfo,
    from: number,
    to: number,
    onDataCallback: GetMarksCallback<Mark>,
    resolution: ResolutionString
  ) => {
    const marks = [] as Mark[];
    const url =
      environment.spikeApiURL +
      `?&isPrc=true&symbol=${symbolInfo.name}&startTime=${
        from * 1000
      }&endTime=${to * 1000}`;

    const stopKillersUrl =
      environment.stopKillerApiURL +
      `?&symbol=${symbolInfo.name}&startTime=${from * 1000}&endTime=${
        to * 1000
      }`;

    const spikes$ = rxjsFrom(fetch(url).then((res) => res.json()));
    const stopKillers$ = rxjsFrom(
      fetch(stopKillersUrl).then((res) => res.json())
    );

    forkJoin([spikes$, stopKillers$]).subscribe(([spikes, stopKillers]) => {
      const diff = 60 * parseInt(resolution);

      spikes.forEach((spike: ISpike) => {
        const timestamp = Math.floor(spike.timestamp / 1000 - 60);
        if (
          ['1', '3', '5'].includes(resolution) &&
          (marks.length === 0 || timestamp - marks[0].time > diff)
        ) {
          marks.unshift({
            id: timestamp,
            time: timestamp,
            color: spike.direction == 'BUY' ? 'green' : 'red',
            text: `Spike: ${spike.symbol}, Side: ${spike.direction}`,
            label: 'LS',
            labelFontColor: 'white',
            minSize: 25,
          });
        }
      });

      stopKillers.forEach((stopKiller: IStopKiller) => {
        const timestamp = Math.floor(stopKiller.timestamp / 1000 - 60);
        marks.unshift({
          id: uuidv4(),
          time: timestamp,
          color: stopKiller.side == 'DOWN' ? 'green' : 'red',
          text: `$: ${Math.abs(stopKiller.delta)}`,
          label: 'SK',
          labelFontColor: 'white',
          minSize: stopKiller.params.bbMult == 4 ? 35 : 25,
        });
      });

      onDataCallback(marks);
    });
  };

  getTimescaleMarks = (
    symbolInfo: LibrarySymbolInfo,
    startDate: number,
    endDate: number,
    onDataCallback: GetMarksCallback<TimescaleMark>,
    resolution: ResolutionString
  ) => {
    let currency = symbolInfo.name.split('USDT')[0].split('BUSD')[0];
    let news$: Observable<INewsObject[]> = rxjsFrom(
      fetch(
        environment.newsApiURL +
          '?symbol=' +
          currency +
          '&startTime=' +
          startDate * 1000
      ).then((res) => res.json())
    );

    news$.subscribe((news) => {
      let marks: TimescaleMark[] = [];
      marks = news.map((n) => {
        return {
          id: n.id,
          time: new Date(n.published_at).getTime() / 1000,
          color: 'green',
          shape: 'earning',
          label: 'N',
          tooltip: [n.title],
        };
      });
      onDataCallback(marks);
    });
  };
}
