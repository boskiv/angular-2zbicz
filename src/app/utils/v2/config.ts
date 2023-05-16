import {
  DatafeedConfiguration,
  ResolutionString,
} from '@assets/charting_library';

export enum EXCHANGES {
  BINANCE = 'Binance',
  SANTIMENT = 'Santiment',
  MANIPULATIONS = 'Manipulations',
  OPEN_INTEREST = 'Open Interest',
}

export const SANTIMENT_CACHE_DURATION = 60 * 60; // in seconds

export const BINANCE_RESOLUTION_MAP: Record<string, string> = {
  '1': '1m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '240': '4h',
  '1D': '1d',
  '1W': '1w',
  '1M': '1M',
};

const supportedResolution: ResolutionString[] = [
  '1' as ResolutionString,
  '5' as ResolutionString,
  '15' as ResolutionString,
  '30' as ResolutionString,
  '60' as ResolutionString,
  '120' as ResolutionString,
  '240' as ResolutionString,
  '360' as ResolutionString,
  '480' as ResolutionString,
  '720' as ResolutionString,
];

export const CHART_CONFIG: DatafeedConfiguration = {
  supported_resolutions: supportedResolution,
  supports_marks: true,
  supports_timescale_marks: true,
  exchanges: [
    {
      value: 'Binance',
      name: 'Binance',
      desc: 'Binance Exchange',
    },
  ],
  symbols_types: [
    {
      name: 'crypto',
      value: 'crypto',
    },
  ],
};

export const RESOLUTION_TO_MILLIS: Record<string, number> = {
  '1': 60 * 1000,
  '5': 5 * 60 * 1000,
  '15': 15 * 60 * 1000,
  '30': 30 * 60 * 1000,
  '60': 60 * 60 * 1000,
  '240': 240 * 60 * 1000,
  '1D': 24 * 60 * 60 * 1000,
  '1W': 7 * 24 * 60 * 60 * 1000,
  '1M': 30 * 24 * 60 * 60 * 1000,
};
