import {
  CustomIndicator,
  FilledAreaType,
  IPineStudyResult,
  LibraryPineStudy,
  PineJS,
  RawStudyMetaInfoId,
  StudyPlotType,
  StudyTargetPriceScale,
} from '@assets/charting_library';
import { environment } from '@environments/environment';

export const manipulationMonitor = (PineJS: PineJS): CustomIndicator => {
  return {
    name: 'Manipulation Monitor',
    metainfo: {
      _metainfoVersion: 51,
      id: 'manipulation-monitor@tv-basicstudies-1' as RawStudyMetaInfoId,
      description: 'Manipulation Monitor',
      shortDescription: 'Manipulation Monitor',
      is_hidden_study: false,
      is_price_study: false,
      isCustomIndicator: true,
      linkedToSeries: false,
      priceScale: StudyTargetPriceScale.NoScale,
      format: {
        type: 'percent',
        // Precision is set to one digit, e.g. 777.7
        precision: 1,
      },
      plots: [
        {
          id: 'plot_0',
          type: StudyPlotType.Line,
        },
      ],

      filledAreas: [
        {
          id: 'filledAreaId1',
          objAId: 'plot_0',
          objBId: 'plot_1',
          title: 'Filled area between first and second plot',
          type: FilledAreaType.TypePlots,
        },
      ],

      defaults: {
        filledAreasStyle: {
          filledAreaId1: {
            fillType: 'gradient',
            topColor: 'rgba(0, 255, 0, 0.4)',
            bottomColor: 'rgba(255, 0, 0, 0.4)',
            visible: true,
            transparency: 100,
          },
        },

        styles: {
          plot_0: {
            linestyle: 0,
            visible: true,
            linewidth: 1,
            plottype: 4,
            trackPrice: true,
            color: '#FF6545',
            transparency: 0,
          },
        },
        precision: 4,
        inputs: {},
      },
      styles: {
        plot_0: {
          title: 'Manipulation price',
          histogramBase: 0,
        },
      },
      inputs: [],
    },

    constructor: function (this: LibraryPineStudy<IPineStudyResult>) {
      this.init = function (context, inputCallback) {
        this._context = context;
        this._input = inputCallback;
        if (!environment.production) console.log('context', this._context);
        const symbol = `${
          this._context.symbol.info.name.split('USDT')[0]
        }#SF_MANIPULATION_MONITOR`;
        this._context.new_sym(symbol, PineJS.Std.period(this._context));

        if (!environment.production) console.log('context', this._context);
      };

      this.main = function (context, inputCallback) {
        this._context = context;
        this._input = inputCallback;

        // switch to the first requested symbol
        this._context.select_sym(1);
        // save the first series' time and close value
        var firstSymbolTimeSeries = this._context.new_var(
          this._context.symbol.time
        );
        var firstSeriesCloseSeries = this._context.new_var(
          PineJS.Std.close(this._context)
        );

        this._context.select_sym(0);
        // save series' time
        var mainSymbolTimeSeries = this._context.new_var(
          this._context.symbol.time
        );

        let value = firstSeriesCloseSeries.adopt(
          firstSymbolTimeSeries,
          mainSymbolTimeSeries
        );
        // let lastValue = value;

        // important part: use adopt to find proper value inside series
        // thus, let's look at firstSeriesCloseSeries.adopt(firstSymbolTimeSeries, mainSymbolTimeSeries)
        // here we trying to find proper close value of the first series, "adopting" it to the main series' time
        return [value];
      };
    },
  };
};
