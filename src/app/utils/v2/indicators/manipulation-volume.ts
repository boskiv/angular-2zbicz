import {
  CustomIndicator,
  IPineStudyResult,
  LibraryPineStudy,
  PineJS,
  RawStudyMetaInfoId,
  StudyPlotType,
  StudyTargetPriceScale,
} from '@assets/charting_library';

export const manipulationVolume = (PineJS: PineJS): CustomIndicator => {
  return {
    name: 'Manipulation Volume',
    metainfo: {
      _metainfoVersion: 51,
      id: 'manipulation-volume@tv-basicstudies-1' as RawStudyMetaInfoId,
      description: 'Manipulation Volume',
      shortDescription: 'Manipulation Volume',
      is_hidden_study: false,
      is_price_study: false,
      isCustomIndicator: true,
      linkedToSeries: false,
      priceScale: StudyTargetPriceScale.NoScale,
      format: {
        type: 'percent',
        precision: 2,
      },
      plots: [
        {
          id: 'plot_0',
          type: StudyPlotType.Line,
        },
        {
          id: 'plot_1',
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

        styles: {
          plot_0: {
            linestyle: 0,
            visible: true,
            linewidth: 4,
            plottype: 1,
            trackPrice: false,
            color: '#FFFFFF',
          },
        },
        precision: 4,
        inputs: {},
      },
      styles: {
        plot_0: {
          title: 'Manipulation volume',
          histogramBase: 0,
        },
      },
      inputs: [],
    },

    constructor: function (this: LibraryPineStudy<IPineStudyResult>) {
      this.init = function (context, inputCallback) {
        this._context = context;
        this._input = inputCallback;
        const symbol = `${this._context.symbol.info.name}#SF_MANIPULATION_MONITOR`;
        this._context.new_sym(symbol, PineJS.Std.period(this._context));
      };

      this.main = function (context, inputCallback) {
        this._context = context;
        this._input = inputCallback;

        this._context.select_sym(1);
        let firstSymbolTimeSeries = this._context.new_var(
          this._context.symbol.time
        );
        let firstSeriesCloseSeries = this._context.new_var(
          PineJS.Std.close(this._context)
        );

        this._context.select_sym(0);
        // save series' time
        let mainSymbolTimeSeries = this._context.new_var(
          this._context.symbol.time
        );

        let high = PineJS.Std.highest(firstSeriesCloseSeries, 3, this._context);
        let value =
          firstSeriesCloseSeries.adopt(
            firstSymbolTimeSeries,
            mainSymbolTimeSeries
          ) > 0
            ? firstSeriesCloseSeries.adopt(
                firstSymbolTimeSeries,
                mainSymbolTimeSeries
              )
            : high;

        let color;

        switch (true) {
          case value < 0.5:
            color = undefined;
            break;
          case value > 0.5 && value <= 5:
            color = 100;
            break;
          case value > 5 && value <= 50:
            color = 200;
            break;
          case value > 50 && value <= 95:
            color = 300;
            break;
          case value > 95:
            color = 400;
            break;
        }
        return [value, color];
      };
    },
  };
};
