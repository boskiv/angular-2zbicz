import { LineStudyPlotStyle } from '@app/utils/v2/indicators/utils';
import {
  CustomIndicator,
  IPineStudyResult,
  LibraryPineStudy,
  PineJS,
  RawStudyMetaInfoId,
  StudyPlotType,
  StudyTargetPriceScale,
} from '@assets/charting_library';
import { environment } from '@environments/environment';

export const socialVolume = (PineJS: PineJS): CustomIndicator => {
  return {
    name: 'Social Volume',
    metainfo: {
      _metainfoVersion: 51,
      id: 'social-volume@tv-basicstudies-1' as RawStudyMetaInfoId,
      description: 'Social Volume',
      shortDescription: 'Social Volume',
      is_hidden_study: false,
      is_price_study: false,
      isCustomIndicator: true,
      linkedToSeries: false,
      priceScale: StudyTargetPriceScale.NoScale,
      format: {
        type: 'price',
        // Precision is set to one digit, e.g. 777.7
        precision: 2,
      },

      plots: [{ id: 'plot_0', type: StudyPlotType.Line }],
      defaults: {
        styles: {
          plot_0: {
            linestyle: 0,
            visible: true,

            // Make the line thinner
            linewidth: 3,

            // Plot type is Line
            plottype: LineStudyPlotStyle.Histogram,

            // Show price line
            trackPrice: false,

            // Set the plotted line color to dark red
            color: 'rgba(255,167,38,0.6)',
          },
        },

        inputs: {},
      },
      styles: {
        plot_0: {
          // Output name will be displayed in the Style window
          title: 'Volume value',
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
        }#SANTIMENTS_SOCIAL_VOLUME_TOTAL`;
        this._context.new_sym(symbol, PineJS.Std.period(this._context));
        if (!environment.production) console.log('context', this._context);
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
        // switch back to the main symbol (chart's symbol)
        this._context.select_sym(0);
        // save series' time
        const mainSymbolTimeSeries = this._context.new_var(
          this._context.symbol.time
        );
        // this._context.select_sym(0);
        return [
          firstSeriesCloseSeries.adopt(
            firstSymbolTimeSeries,
            mainSymbolTimeSeries
          ),
        ];
      };
    },
  };
};
