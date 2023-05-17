import { findLegsName } from '@app/utils/helpers';
import { CHART_CONFIG, EXCHANGES } from '@app/utils/v2/config';
import {
  getBinanceSymbols,
  getManipulationIndicatorSymbols,
  getOpenInterestIndicatorSymbols,
  getSentimentsSymbols,
  IFilter,
} from '@app/utils/v2/utils';
import {
  IDatafeedChartApi,
  LibrarySymbolInfo,
  SearchSymbolResultItem,
  VisiblePlotsSet,
} from '@assets/charting_library';

type IExtendSearchSymbolResultItem = SearchSymbolResultItem & {
  filters?: IFilter[];
  pricescale?: number;
};

export async function getAllSymbols(): Promise<
  IExtendSearchSymbolResultItem[]
> {
  let symbols: IExtendSearchSymbolResultItem[] = [];
  const binanceSymbols = await getBinanceSymbols();
  const sentimentsSymbols = await getSentimentsSymbols(binanceSymbols);
  const manipulationIndicatorSymbols = await getManipulationIndicatorSymbols(
    binanceSymbols
  );
  const openInterestIndicatorSymbols = await getOpenInterestIndicatorSymbols(
    binanceSymbols
  );

  binanceSymbols.forEach((bs) => {
    symbols.push({
      ticker: `${EXCHANGES.BINANCE}:${bs.symbol}`,
      symbol: bs.symbol,
      full_name: `${EXCHANGES.BINANCE}:${bs.symbol}`,
      description: bs.symbol,
      exchange: `${EXCHANGES.BINANCE}`,
      type: 'crypto',
      filters: bs.filters,
    });
  });

  sentimentsSymbols.forEach((ss) => {
    symbols.push({
      ticker: `${EXCHANGES.SANTIMENT}:${ss.symbol}`,
      symbol: ss.symbol,
      full_name: `${EXCHANGES.SANTIMENT}:${ss.symbol}`,
      description: ss.symbol,
      exchange: `${EXCHANGES.SANTIMENT}`,
      type: 'crypto',
    });
  });

  manipulationIndicatorSymbols.forEach((ss) => {
    symbols.push({
      ticker: `${EXCHANGES.MANIPULATIONS}:${ss.symbol}`,
      symbol: ss.symbol,
      full_name: `${EXCHANGES.MANIPULATIONS}:${ss.symbol}`,
      description: ss.symbol,
      exchange: `${EXCHANGES.MANIPULATIONS}`,
      type: 'crypto',
    });
  });

  openInterestIndicatorSymbols.forEach((ss) => {
    symbols.push({
      ticker: `${EXCHANGES.OPEN_INTEREST}:${ss.symbol}`,
      symbol: ss.symbol,
      full_name: `${EXCHANGES.OPEN_INTEREST}:${ss.symbol}`,
      description: ss.symbol,
      exchange: `${EXCHANGES.OPEN_INTEREST}`,
      type: 'crypto',
    });
  });

  return symbols;
}

export interface IExtendedLibrarySymbolInfo extends LibrarySymbolInfo {
  legs: string[];
  allLegsSymbols: IExtendSearchSymbolResultItem[];
}

export const resolveSymbol: IDatafeedChartApi['resolveSymbol'] = async (
  fullName,
  onSymbolResolvedCallback,
  onResolveErrorCallback,
  _extension
) => {
  let baseResolveSymbol: IExtendedLibrarySymbolInfo = {
    allLegsSymbols: [],
    legs: [],
    listed_exchange: '',
    ticker: fullName,
    full_name: fullName,
    format: 'price',
    name: fullName,
    description: fullName.replaceAll('USDT', '').replaceAll('BUSD', ''),
    type: 'crypto',
    session: '24x7',
    timezone: 'Etc/UTC',
    exchange: 'Binance',
    minmov: 1,
    pricescale: 100,
    has_intraday: true,
    has_weekly_and_monthly: true,
    supported_resolutions: CHART_CONFIG.supported_resolutions!,
    volume_precision: 1,
    data_status: 'streaming',
  };

  let symbol = {} as IExtendedLibrarySymbolInfo;

  switch (true) {
    case fullName.includes('#SF_MANIPULATION_MONITOR'):
      symbol = {
        ...baseResolveSymbol,
        visible_plots_set: 'c' as VisiblePlotsSet,
        pricescale: 100,
        has_ticks: true,
        exchange: EXCHANGES.MANIPULATIONS,
        listed_exchange: EXCHANGES.MANIPULATIONS,
      };
      setTimeout(() => {
        console.log('resolveSymbol', symbol.pricescale);
        onSymbolResolvedCallback(symbol);
      }, 0);
      break;
    case fullName.includes('#SANTIMENTS_'):
      symbol = {
        ...baseResolveSymbol,
        visible_plots_set: 'c' as VisiblePlotsSet,
        pricescale: 100,
        exchange: EXCHANGES.SANTIMENT,
        listed_exchange: EXCHANGES.SANTIMENT,
      };
      setTimeout(() => {
        console.log('resolveSymbol', symbol.pricescale);
        onSymbolResolvedCallback(symbol);
      }, 0);
      break;
    default:
      const symbols = await getAllSymbols();
      Object.values(EXCHANGES).forEach((exchange) => {
        fullName = fullName
          .toUpperCase()
          .replaceAll(`${exchange.toUpperCase()}:`, '');
      });
      // get all legs from fullname
      const legs = findLegsName(fullName, true);

      const priceScaleSymbols = (symbol: string): number => {
        const legs = findLegsName(symbol, true);
        const params: any = {};
        const ar: number[] = [];
        for (const leg of legs) {
          for (const symbol of symbols) {
            if (symbol.symbol === leg && symbol.filters) {
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
      };

      if (legs.length) {
        const allLegsSymbols = symbols.filter(({ full_name }) =>
          legs.some((leg) =>
            full_name.toUpperCase().endsWith(leg.toUpperCase())
          )
        );

        if (!allLegsSymbols.length) {
          onResolveErrorCallback('cannot resolve symbol');
          return;
        }

        const symbolInfo: IExtendedLibrarySymbolInfo = {
          ticker: fullName,
          full_name: fullName,
          format: 'price',
          listed_exchange: allLegsSymbols[0].exchange,
          name: fullName,
          description: fullName.replaceAll('USDT', '').replaceAll('BUSD', ''),
          type: allLegsSymbols[0].type,
          session: '24x7',
          timezone: 'Etc/UTC',
          exchange: allLegsSymbols[0].exchange,
          minmov: 1,
          pricescale: priceScaleSymbols(fullName),
          has_intraday: true,
          has_weekly_and_monthly: true,
          supported_resolutions: CHART_CONFIG.supported_resolutions!,
          volume_precision: 1,
          data_status: 'streaming',
          legs: legs,
          allLegsSymbols: allLegsSymbols,
        };

        onSymbolResolvedCallback(symbolInfo);
      }
  }
};
