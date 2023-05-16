import { LineStudyPlotStyle } from '@app/utils/v2/indicators/utils';
import {
  CustomIndicator,
  PineJS,
  RawStudyMetaInfoId,
  StudyPlotType,
} from '@assets/charting_library';

export const pairTrading = (PineJS: PineJS): CustomIndicator => {
  return {
    name: 'Pair Trading',
    metainfo: {
      _metainfoVersion: 51,
      id: 'Pair Trading@tv-basicstudies-1' as RawStudyMetaInfoId,
      description: 'This is Pair Trading indicator.',
      shortDescription: 'Pair Trading',
      is_hidden_study: false,
      is_price_study: false,
      isCustomIndicator: true,
      format: {
        type: 'price',
        // Precision is set to one digit, e.g. 777.7
        precision: 1,
      },

      plots: [
        { id: 'plot_0', type: StudyPlotType.Line },
        { id: 'plot_1', type: StudyPlotType.Line },
        { id: 'plot_2', type: StudyPlotType.Line },
      ],
      defaults: {
        styles: {
          plot_0: {
            linestyle: 0,
            visible: true,
            linewidth: 1,
            plottype: LineStudyPlotStyle.Line,
            trackPrice: false,
            color: '#FF0000',
            transparency: 40,
          },
          plot_1: {
            linestyle: 0,
            visible: true,
            linewidth: 1,
            plottype: LineStudyPlotStyle.Line,
            trackPrice: false,
            color: '#FFFFFF',
          },
          plot_2: {
            linestyle: 0,
            visible: true,
            linewidth: 1,
            plottype: LineStudyPlotStyle.Line,
            trackPrice: false,
            color: '#FFFFFF',
          },
        },
        precision: 2,
        inputs: {},
      },
      styles: {
        plot_0: {
          title: 'Value',
          histogramBase: 0,
        },
        plot_1: {
          title: 'Upper Band',
          histogramBase: 0,
        },
        plot_2: {
          title: 'Lower Band',
          histogramBase: 0,
        },
      },
      inputs: [],
    },

    constructor: function () {
      this.init = function (context, inputCallback) {
        this._context = context;
        this._input = inputCallback;
      };

      this.main = function (context, inputCallback) {
        this._context = context;
        this._input = inputCallback;
        const closeSeries = context.new_var(PineJS.Std.close(context));
        const close = PineJS.Std.close(this._context);
        const smalength = 240;
        const entryzscore = 3.0;
        const bbLength = 240;
        const bbStdDev = 3;

        const ma = PineJS.Std.sma(closeSeries, smalength, context);

        const upperBand =
          ma + bbStdDev * PineJS.Std.stdev(closeSeries, bbLength, context);
        const lowerBand =
          ma - bbStdDev * PineJS.Std.stdev(closeSeries, bbLength, context);

        return [ma, upperBand, lowerBand];
      };
    },
  };
};
