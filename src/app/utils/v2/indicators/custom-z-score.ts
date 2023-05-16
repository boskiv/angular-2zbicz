import { LineStudyPlotStyle } from '@app/utils/v2/indicators/utils';
import {
  CustomIndicator,
  PineJS,
  RawStudyMetaInfoId,
  StudyPlotType,
} from '@assets/charting_library';

export const customZScore = (PineJS: PineJS): CustomIndicator => {
  return {
    name: 'Custom Z-Score Indicator',
    metainfo: {
      _metainfoVersion: 51,
      id: 'Custom Z-Score Indicator@tv-basicstudies-1' as RawStudyMetaInfoId,
      description: 'This is custom Z-Score indicator.',
      shortDescription: 'Custom Z-Score',
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
            plottype: LineStudyPlotStyle.Area,
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
          title: 'Z-Score',
          histogramBase: 0,
        },
        plot_1: {
          title: 'Positive Std Dev',
          histogramBase: 0,
        },
        plot_2: {
          title: 'Negative Std Dev',
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
        const close = PineJS.Std.close(context);
        const length = 240;
        const stdDevs = 3.0;

        const basis = PineJS.Std.sma(closeSeries, length, this._context);
        const zScore =
          (close - basis) /
          PineJS.Std.stdev(closeSeries, length, this._context);

        return [zScore, stdDevs, -stdDevs];
      };
    },
  };
};
