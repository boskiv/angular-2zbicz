import { IManipulation } from '@app/dashboard/components/manipulation-monitor-pane/manipulation-monitor-pane.component';
import { IBinanceWsKline } from '@app/utils/binanceTypes';
import { getNextBarTime, prepareFormula } from '@app/utils/helpers';
import {
  BINANCE_RESOLUTION_MAP,
  EXCHANGES,
  RESOLUTION_TO_MILLIS,
} from '@app/utils/v2/config';
import { lastBarsCache, parseFullSymbol } from '@app/utils/v2/getBars';
import { IExtendedLibrarySymbolInfo } from '@app/utils/v2/resolveSymbols';
import {
  Bar,
  IDatafeedChartApi,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from '@assets/charting_library';
import { environment } from '@environments/environment';
import Formula from 'fparser';
import { filter, map, retry } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

type Handler = {
  id: string;
  callback: SubscribeBarsCallback;
};

type Subscription = {
  subscriberUID: string;
  resolution: ResolutionString;
  lastBar: Bar | undefined;
  handlers: Handler[];
};

// {"openInterest":"218392342","symbol":"ANKRUSDT","time":1683461600064}
type OpenInterestSubscription = {
  openInterest: string;
  symbol: string;
  time: number;
};

const channelToSubscription = new Map<string, Subscription>();

function subscribeOnOpenInterest(
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  subscriberUID: string,
  onRealtimeCallback: SubscribeBarsCallback
): Bar {
  let tradingSymbol = symbolInfo.full_name.split('#')[0] + 'USDT';
  webSocket(environment.openInterestWS)
    .pipe(
      map((data: any) => {
        return JSON.parse(atob(data.data)) as OpenInterestSubscription;
      }),
      filter((data) => data.symbol === tradingSymbol)
    )
    .subscribe((data) => {
      onRealtimeCallback({
        time: new Date(Math.floor(data.time / 60000) * 60000).getTime(),
        open: parseFloat(data.openInterest),
        high: parseFloat(data.openInterest),
        low: parseFloat(data.openInterest),
        close: parseFloat(data.openInterest),
        volume: 0,
      });
    });
  return {} as Bar;
}

function subscribeOnManipulationMonitor(
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  subscriberUID: string,
  onRealtimeCallback: SubscribeBarsCallback
) {
  let tradingSymbol = symbolInfo.full_name.split('#')[0] + 'USDT';
  console.log('subscribeOnManipulationMonitor', tradingSymbol);
  webSocket(`${environment.manipulationWsURL}`)
    .pipe(
      retry({
        count: 10,
        resetOnSuccess: true,
        delay: 1000,
      }),
      map((data: any) => {
        return JSON.parse(atob(data.data)) as IManipulation;
      }),
      filter((data) => data.symbol === tradingSymbol)
    )
    .subscribe((data: IManipulation) => {
      onRealtimeCallback({
        time: new Date(Math.floor(data.timestamp / 60000) * 60000).getTime(),
        close: ((1 - data.corrV) * 100) / 2,
        open: ((1 - data.corr) * 100) / 2,
        high: 0,
        low: 0,
      });
    });
}

// ...
export const subscribeOnStream: IDatafeedChartApi['subscribeBars'] = (
  symbolInfo,
  resolution,
  onRealtimeCallback,
  subscriberUID
) => {
  const interval = BINANCE_RESOLUTION_MAP[resolution];
  const lastKline: Map<string, IBinanceWsKline> = new Map();

  const parsedSymbol = parseFullSymbol(symbolInfo.ticker!);
  if (!parsedSymbol) {
    return console.error('Could not subscribe to bars', symbolInfo.full_name);
  }

  const channelString = symbolInfo.full_name;
  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
  };
  let subscriptionItem = channelToSubscription.get(subscriberUID);
  if (subscriptionItem) {
    // already subscribed to the channel, use the existing subscription
    subscriptionItem.handlers.push(handler);
    return;
  }
  subscriptionItem = {
    subscriberUID,
    resolution,
    lastBar: lastBarsCache.get(symbolInfo.name + '_' + resolution),
    handlers: [handler],
  };

  channelToSubscription.set(subscriberUID, subscriptionItem);

  switch (symbolInfo.exchange) {
    case EXCHANGES.SANTIMENT:
      return console.info(
        'Skip subscription to santiment symbol',
        symbolInfo.full_name
      );
    case EXCHANGES.OPEN_INTEREST:
      subscribeOnOpenInterest(
        symbolInfo,
        resolution,
        subscriberUID,
        onRealtimeCallback
      );
      return;
    case EXCHANGES.MANIPULATIONS:
      subscribeOnManipulationMonitor(
        symbolInfo,
        resolution,
        subscriberUID,
        onRealtimeCallback
      );
      return;
    case EXCHANGES.BINANCE:
      const _symbolInfo = symbolInfo as IExtendedLibrarySymbolInfo;
      const streamUrl = _symbolInfo.legs.reduce((acc, leg) => {
        return `${acc}/${leg.toLowerCase()}@kline_${interval}`;
      }, '');

      const preparedFormula = prepareFormula(symbolInfo.name);
      const formula = new Formula(preparedFormula);
      webSocket(`wss://test.zelezyaka.ru/stream?streams=${streamUrl.slice(1)}`)
        .pipe(
          retry({
            count: 10,
            resetOnSuccess: true,
            delay: 1000,
          })
        )
        .subscribe(({ data }: any) => {
          if (_symbolInfo.legs.length === 1) {
            const kline = data.k;
            lastKline.set(data.s + '_' + interval, kline);
            onRealtimeCallback({
              time: kline.t,
              close: parseFloat(kline.c),
              open: parseFloat(kline.o),
              high: parseFloat(kline.h),
              low: parseFloat(kline.l),
              volume: parseFloat(kline.v),
            });
          } else {
            const sub = channelToSubscription.get(subscriberUID);
            const lastLegKline = new Map<string, IBinanceWsKline>();
            for (const leg of _symbolInfo.legs) {
              const last = lastKline.get(leg + '_' + interval);
              if (last != undefined) {
                lastLegKline.set(leg, last);
              }
            }
            const wsKline = data.k;
            const lastBar = sub?.lastBar as Bar;

            const nextBarTime = getNextBarTime(lastBar?.time, interval);
            const params: any = {};
            let volume = 0;
            lastKline.set(data.s + '_' + interval, wsKline);

            for (const symbol of _symbolInfo.legs) {
              const kl = lastLegKline.get(symbol);
              volume += (Number(kl ? kl.v : '0') + Number(kl ? kl.q : '0')) / 2;
              params[symbol] = kl?.c;
            }
            let bar: Bar;
            if (lastLegKline.size === _symbolInfo.legs.length) {
              const close = formula.evaluate(params);
              if (wsKline.t >= nextBarTime) {
                bar = {
                  open: close,
                  high: close,
                  low: close,
                  close: close,
                  volume: 0,
                  time: nextBarTime,
                };
              } else {
                bar = {
                  ...lastBar,
                  high: Math.max(lastBar.high, close),
                  low: Math.min(lastBar.low, close),
                  volume: volume,
                  close: close,
                };
              }
            } else {
              bar = lastBar;
            }
            if (sub) {
              sub.lastBar = bar;
              onRealtimeCallback(bar);
            }
          }
        });
      return;
    default:
      console.error('Unknown exchange', symbolInfo.exchange);
      return;
  }
};

export const unsubscribeFromStream = (subscriberUID: string) => {
  // find a subscription with id === subscriberUID
  for (const channelString of Array.from(channelToSubscription.keys())) {
    const subscriptionItem = channelToSubscription.get(subscriberUID);
    const handlerIndex = subscriptionItem?.handlers.findIndex(
      (handler) => handler.id === subscriberUID
    );

    if (handlerIndex !== -1 && handlerIndex) {
      // remove from handlers
      subscriptionItem!.handlers.splice(handlerIndex, 1);

      if (subscriptionItem!.handlers.length === 0) {
        // unsubscribe from the channel, if it was the last handler
        channelToSubscription.delete(channelString);
        break;
      }
    }
  }
};

export const pushPrice = (exchange: string, pair: string, price: number) => {
  const channelString = `${exchange}:${pair}`;
  const subscriptionItem = channelToSubscription.get(channelString);
  if (subscriptionItem === undefined) {
    return;
  }

  const diff = Date.now() - (subscriptionItem.lastBar?.time || 0);
  const isNewBar = diff > RESOLUTION_TO_MILLIS[subscriptionItem.resolution];

  const lastBar = subscriptionItem.lastBar ?? {
    high: price,
    low: price,
    close: price,
    time: Date.now(),
  };

  const bar: Bar = {
    time: !isNewBar
      ? lastBar.time
      : lastBar.time + RESOLUTION_TO_MILLIS[subscriptionItem.resolution],
    open: price,
    high: !isNewBar ? Math.max(lastBar.high, price) : price,
    low: !isNewBar ? Math.min(lastBar.low, price) : price,
    close: price,
  };
  subscriptionItem.lastBar = bar;

  // send data to every subscriber of that symbol
  subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
};
