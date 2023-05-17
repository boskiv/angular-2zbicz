import { LineStudyPlotStyle } from '@app/utils/v2/indicators/utils';
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
        precision: 2,
      },
      plots: [
        {
          id: 'plot_0',
          type: StudyPlotType.Line,
        },
        {
          id: 'plot_1',
          type: StudyPlotType.Line,
        },
        {
          id: 'plot_2',
          target: 'filledAreaId1',
          type: StudyPlotType.Data,
          targetField: 'topValue',
        },
        {
          id: 'plot_3',
          type: StudyPlotType.Line,
        },
        {
          id: 'plot_4',
          type: StudyPlotType.BgColorer,
          palette: 'palette_0',
        },
      ],
      palettes: {
        palette_0: {
          colors: [
            { name: 'Color 0' },
            { name: 'Color 1' },
            { name: 'Color 2' },
            { name: 'Color 3' },
          ],
          valToIndex: {
            100: 0,
            200: 1,
            300: 2,
            400: 3,
          },
        },
      },

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
        palettes: {
          palette_0: {
            colors: [
              { color: '#00a5cf' },
              { color: '#12d512' },
              { color: '#f5bb00' },
              { color: '#ba2d0b' },
            ],
          },
        },
        filledAreasStyle: {
          filledAreaId1: {
            fillType: 'gradient',
            topValue: 100,
            bottomValue: 0,
            topColor: 'rgb(218,96,19)',
            bottomColor: 'rgba(255, 0, 0, 0.4)',
            visible: true,

            transparency: 100,
          },
        },

        styles: {
          plot_0: {
            visible: false,
          },
          plot_1: {
            linestyle: 0,
            visible: true,
            linewidth: 1,
            plottype: LineStudyPlotStyle.Line,
            trackPrice: false,
            color: '#FFFFFF',
            transparency: 0,
          },
          plot_3: {
            linestyle: 0,
            visible: true,
            linewidth: 1,
            plottype: LineStudyPlotStyle.Line,
            trackPrice: false,
            color: '#003cff',
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
        const symbol = `${
          this._context.symbol.info.name.split('USDT')[0]
        }#SF_MANIPULATION_MONITOR`;
        this._context.new_sym(symbol, PineJS.Std.period(this._context));
      };

      this.main = function (context, inputCallback) {
        this._context = context;
        this._input = inputCallback;
        // switch to the first requested symbol
        this._context.select_sym(1);

        // save the first series' time and close value
        const firstSymbolTimeSeries = this._context.new_var(
          this._context.symbol.time
        );

        const firstSeriesCloseSeries = this._context.new_var(
          PineJS.Std.close(this._context)
        );

        const firstSeriesOpenSeries = this._context.new_var(
          PineJS.Std.open(this._context)
        );
        //
        this._context.select_sym(0);

        // save series' time
        const mainSymbolTimeSeries = this._context.new_var(
          this._context.symbol.time
        );
        // save series' close value
        let volumeValue = firstSeriesCloseSeries.adopt(
          firstSymbolTimeSeries,
          mainSymbolTimeSeries
        );

        let priceValue = firstSeriesOpenSeries.adopt(
          firstSymbolTimeSeries,
          mainSymbolTimeSeries
        );

        let color;
        switch (true) {
          case priceValue < 0.5:
            color = undefined;
            break;
          case priceValue > 0.5 && priceValue <= 5:
            color = 100;
            break;
          case priceValue > 5 && priceValue <= 50:
            color = 200;
            break;
          case priceValue > 50 && priceValue <= 95:
            color = 300;
            break;
          case priceValue > 95:
            color = 400;
            break;
        }

        return [0, priceValue, priceValue, volumeValue, color];
      };
    },
  };
};
