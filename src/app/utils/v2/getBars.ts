import { IBinanceKlineArray } from '@app/utils/binanceTypes';
import { findLegsName, prepareFormula } from '@app/utils/helpers';
import { BINANCE_RESOLUTION_MAP, EXCHANGES } from '@app/utils/v2/config';
import {
  fetchManipulationBars,
  fetchOpenInterestBars,
  fetchSantimentBars,
} from '@app/utils/v2/utils';
import { Bar, IDatafeedChartApi } from '@assets/charting_library';

import { environment, klineDomain } from '@environments/environment';
import Formula from 'fparser';

export function parseFullSymbol(fullSymbol: string) {
  let exchange = fullSymbol.split(':')[0];
  let fromSymbol;
  let toSymbol;
  if (exchange === EXCHANGES.MANIPULATIONS) {
    exchange = EXCHANGES.MANIPULATIONS;
    fromSymbol = fullSymbol.split(':')[1].split('#')[0];
    toSymbol = fullSymbol.split(':')[1].split('#')[1];
  } else if (exchange === EXCHANGES.OPEN_INTEREST) {
    exchange = EXCHANGES.SANTIMENT;
    fromSymbol = fullSymbol.split(':')[1].split('#')[0];
    toSymbol = fullSymbol.split(':')[1].split('#')[1];
  } else if (exchange === EXCHANGES.SANTIMENT) {
    exchange = EXCHANGES.SANTIMENT;
    fromSymbol = fullSymbol.split(':')[1].split('#')[0];
    toSymbol = fullSymbol.split(':')[1].split('#')[1];
  } else if (exchange === EXCHANGES.BINANCE) {
    if (!fullSymbol.split(':')[1].includes('USDT')) {
      fromSymbol = fullSymbol.split(':')[1].split('USDT')[0];
      toSymbol = 'USDT';
    } else if (!fullSymbol.split(':')[1].includes('BUSD')) {
      fromSymbol = fullSymbol.split(':')[1].split('BUSD')[0];
      toSymbol = 'BUSD';
    }
  }

  return { exchange: exchange, fromSymbol: fromSymbol, toSymbol: toSymbol };
}

export const getBars: IDatafeedChartApi['getBars'] = async (
  symbolInfo,
  resolution,
  periodParams,
  onHistoryCallback,
  onErrorCallback
) => {
  const { from, to } = periodParams;

  try {
    let bars: Bar[] = [];
    switch (symbolInfo.exchange) {
      case EXCHANGES.BINANCE:
        bars = (await binanceKlines(symbolInfo.name, from, to, resolution)).map(
          (kline) =>
            ({
              time: kline[0],
              open: parseFloat(kline[1]),
              high: parseFloat(kline[2]),
              low: parseFloat(kline[3]),
              close: parseFloat(kline[4]),
              volume: parseFloat(kline[5]),
            } as Bar)
        );
        break;
      case EXCHANGES.SANTIMENT:
        bars = await fetchSantimentBars(symbolInfo.name, from, to, resolution);
        break;
      case EXCHANGES.MANIPULATIONS:
        bars = await fetchManipulationBars(
          symbolInfo.name,
          from,
          to,
          resolution
        );
        console.log('manipulations', bars);
        break;
      case EXCHANGES.OPEN_INTEREST:
        bars = await fetchOpenInterestBars(
          symbolInfo.name,
          from,
          to,
          resolution
        );
        break;
    }

    const filteredBars = bars.filter((b: Bar) => {
      return b.time >= from * 1000 && b.time <= to * 1000;
    });
    // fillBarGaps(filteredBars);
    if (filteredBars.length === 0) {
      onHistoryCallback([], { noData: true });
      return;
    }
    if (periodParams.firstDataRequest) {
      lastBarsCache.set(
        symbolInfo.name + '_' + resolution,
        bars[bars.length - 1]
      );
    }
    onHistoryCallback(bars, { noData: false });
  } catch (error: any) {
    onErrorCallback(error);
  }
};

export const lastBarsCache = new Map<string, Bar>();

async function binanceKlines(
  symbol: string,
  startTime: number,
  endTime: number,
  resolution: string,
  limit: number = 1500
): Promise<IBinanceKlineArray[]> {
  const legs = findLegsName(symbol, true);
  const results = new Map<string, IBinanceKlineArray[]>();
  const interval = BINANCE_RESOLUTION_MAP[resolution];
  const promises = legs.map(async (leg) => {
    return fetch(
      `https://${klineDomain}/fapi/v1/klines?symbol=${encodeURIComponent(
        leg.toUpperCase()
      )}&interval=${interval}&startTime=${startTime * 1000}&endTime=${
        endTime * 1000
      }&limit=${limit}`
    )
      .then<IBinanceKlineArray[]>((res: Response) =>
        res.ok ? res.json() : Promise.resolve()
      )
      .then((kline) => {
        if (!environment.production)
          console.log(
            'requested data',
            symbol,
            legs,
            interval,
            startTime,
            endTime,
            'got',
            kline.length,
            'bars'
          );
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
