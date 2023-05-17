import { CHART_CONFIG } from '@app/utils/v2/config';
import { getBars } from '@app/utils/v2/getBars';
import { getTimescaleMarks } from '@app/utils/v2/getTimescaleMarks';
import { resolveSymbol } from '@app/utils/v2/resolveSymbols';
import { searchSymbols } from '@app/utils/v2/searchSymbols';
import {
  subscribeOnStream,
  unsubscribeFromStream,
} from '@app/utils/v2/streaming';
import { IDatafeedChartApi, IExternalDatafeed } from '@assets/charting_library';
import { Subscription } from 'rxjs';

let subscriptions: Map<string, Subscription> = new Map<string, Subscription>();

const datafeed: IDatafeedChartApi & IExternalDatafeed = {
  onReady: (callback) => {
    setTimeout(() => callback(CHART_CONFIG), 0);
  },
  searchSymbols,
  resolveSymbol,
  getBars,
  getTimescaleMarks,
  subscribeBars: subscribeOnStream,
  unsubscribeBars: unsubscribeFromStream,
};

export default datafeed;
