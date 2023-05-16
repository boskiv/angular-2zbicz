import { Injectable } from '@angular/core';
import {
  IStructureMap,
  StructureMapService,
} from '@app/dashboard/services/structure-map.service';

export interface MarketRatioData {
  [k: string]: {
    value: number;
    absValue: number;
    width: number;
  };
}

interface IMarketData {
  [k: string]: {
    [p: string]: IStructureMap;
  };
}

enum Period {
  Day = 24,
  Week = 168,
}

@Injectable({
  providedIn: 'root',
})
export class MarketRatioService {
  marketData: IMarketData = {};

  constructor(private structureMapService: StructureMapService) {
    this.structureMapService.streamWithRetry$.subscribe((data) => {
      if (data.data.symbol in this.marketData) {
        if (Period.Day in this.marketData[data.data.symbol]) {
          this.marketData[data.data.symbol] = {
            ...this.marketData[data.data.symbol],
            [data.data.param]: data.data,
          };
        } else {
          this.marketData[data.data.symbol] = {
            [data.data.param]: data.data,
          };
        }

        if (Period.Week in this.marketData[data.data.symbol]) {
          this.marketData[data.data.symbol] = {
            ...this.marketData[data.data.symbol],
            [data.data.param]: data.data,
          };
        } else {
          this.marketData[data.data.symbol] = {
            [data.data.param]: data.data,
          };
        }
      } else {
        this.marketData[data.data.symbol] = {
          [data.data.param]: data.data,
        };
      }
    });
  }

  getMarketRatioData(symbol: string): MarketRatioData {
    if (symbol in this.marketData) {
      // console.log(this.marketData);
      if (
        Period.Day in this.marketData[symbol] &&
        Period.Week in this.marketData[symbol]
      ) {
        return {
          day: {
            value: this.marketData[symbol][Period.Day].value,
            absValue: Math.abs(this.marketData[symbol][Period.Day].value),
            width: Math.abs(
              this.marketData[symbol][Period.Day].value * 2 > 100
                ? 100
                : this.marketData[symbol][Period.Day].value * 2
            ),
          },
          week: {
            value: this.marketData[symbol][Period.Week].value,
            absValue: Math.abs(this.marketData[symbol][Period.Day].value),
            width: Math.abs(
              this.marketData[symbol][Period.Week].value * 2 > 100
                ? 100
                : this.marketData[symbol][Period.Week].value * 2
            ),
          },
        };
      }
    }
    return {
      day: {
        value: 0,
        absValue: 0,
        width: 0,
      },
      week: {
        value: 0,
        absValue: 0,
        width: 0,
      },
    } as MarketRatioData;
  }
}
