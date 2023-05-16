import {
  Bar,
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from '@assets/charting_library';
import Formula from 'fparser';
import {
  IBinanceWsKline,
  IBinanceWsKlineEvent,
  IBinanceWsStream,
} from './binanceTypes';
import { findLegsName, getNextBarTime, prepareFormula } from './helpers';

const channelToSubscription: Map<
  string,
  {
    listenerGuid: string;
    symbolName: string;
    symbols: string[];
    resolution: ResolutionString;
    lastBar?: Bar;
    socket: WebSocket;
    handlers: {
      id: string;
      callback: SubscribeBarsCallback;
    }[];
    lastLegKline: Map<string, IBinanceWsKline>;
    formula: string;
    calculator: Formula;
  }
> = new Map();

const lastWsKline: Map<string, IBinanceWsKline> = new Map();

export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  onTick: SubscribeBarsCallback,
  listenerGuid: string,
  onResetCacheNeededCallback: () => void,
  lastBar: Bar | undefined,
  url: string
) {
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
    D: '1d',
    '1D': '1d',
    '3D': '3d',
    W: '1w',
    '1W': '1w',
    M: '1M',
    '1M': '1M',
  }[resolution as string];

  const symbols = findLegsName(symbolInfo.name, true);

  const handler = {
    id: listenerGuid,
    callback: onTick,
  };

  let sub = channelToSubscription.get(listenerGuid);
  if (sub) {
    sub.handlers.push(handler);
    return;
  }

  if (symbols.length == 1) {
    url += '/ws/' + symbolInfo.name.toLowerCase() + '@kline_' + interval;
  } else if (symbols.length > 1) {
    url += '/stream?streams=';
    for (const symbol of symbols) {
      url += symbol.toLowerCase() + '@kline_' + interval + '/';
    }
    url = url.slice(0, -1);
  }

  const socket = new WebSocket(url);
  const formula = prepareFormula(symbolInfo.name);

  sub = {
    listenerGuid: listenerGuid,
    symbolName: symbolInfo.name,
    symbols: symbols,
    resolution: resolution,
    lastBar: lastBar,
    handlers: [handler],
    socket: socket,
    lastLegKline: new Map<string, IBinanceWsKline>(),
    formula: formula,
    calculator: new Formula(formula),
  };
  channelToSubscription.set(listenerGuid, sub);

  if (symbols.length == 1) {
    const sub = channelToSubscription.get(listenerGuid);
    if (sub?.socket) {
      sub.socket.onmessage = (event) => {
        const message: IBinanceWsKlineEvent = JSON.parse(event.data);
        const wsKline = message.k;
        lastWsKline.set(wsKline.s + '_' + interval, wsKline);
        if (wsKline.t !== 0) {
          onTick({
            time: wsKline.t,
            close: parseFloat(wsKline.c),
            open: parseFloat(wsKline.o),
            high: parseFloat(wsKline.h),
            low: parseFloat(wsKline.l),
            volume: parseFloat(wsKline.v),
          });
        }
      };
    }
  } else if (symbols.length > 1) {
    const sub = channelToSubscription.get(listenerGuid);
    for (const symbol of symbols) {
      const last = lastWsKline.get(symbol + '_' + interval);
      if (last != undefined) {
        sub?.lastLegKline.set(last.s, last);
      }
    }

    if (sub?.socket) {
      sub.socket.onmessage = (event) => {
        const message: IBinanceWsStream = JSON.parse(event.data);
        const wsKline = message.data.k;
        const lastBar = sub.lastBar as Bar;
        const nextBarTime = getNextBarTime(lastBar?.time, interval);
        const params: any = {};
        let volume = 0;

        sub.lastLegKline.set(wsKline.s, wsKline);
        lastWsKline.set(wsKline.s + '_' + interval, wsKline);

        for (const symbol of sub.symbols!) {
          const kl = sub.lastLegKline?.get(symbol);
          volume += (Number(kl ? kl.v : '0') + Number(kl ? kl.q : '0')) / 2;
          params[symbol] = sub.lastLegKline.get(symbol)?.c;
        }

        let bar: Bar;
        if (sub.lastLegKline.size == sub.symbols.length) {
          const close = sub.calculator.evaluate(params);
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

        sub.lastBar = bar;
        sub.handlers.forEach((handler) => handler.callback(bar));
      };
    }
  }
}

export function unsubscribeFromStream(listenerGuid: string): string {
  const sub = channelToSubscription.get(listenerGuid);
  const name = sub?.symbolName;
  if (sub?.socket) {
    sub.socket.close();
    channelToSubscription.delete(listenerGuid);
  }
  return <string>name;
}
