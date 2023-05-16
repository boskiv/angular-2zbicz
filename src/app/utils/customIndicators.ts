// @ts-nocheck
export function customIndicators(PineJS) {
  return Promise.resolve([
    {
      name: 'deviationMA',
      metainfo: {
        _metainfoVersion: 0,
        id: 'deviationMA@tv-basicstudies-1',
        scriptIdPart: '',
        name: 'deviationMA',
        description: 'Deviation from the moving average',
        shortDescription: 'Deviation from MA',

        is_hidden_study: false,
        is_price_study: false,
        isCustomIndicator: true,

        plots: [
          { id: 'plot_0', type: 'area' },
          { id: 'plot_1', type: 'area' },
        ],
        defaults: {
          styles: {
            plot_0: {
              linestyle: 0,
              visible: true,
              linewidth: 1,
              plottype: 4,
              transparency: 70,
              color: '#00ff39',
            },
            plot_1: {
              linestyle: 0,
              visible: true,
              linewidth: 1,
              plottype: 4,
              transparency: 70,
              color: '#ff0027',
            },
          },
          bands: [
            {
              color: 'rgba(29,161,26,0.3)',
              linestyle: 2,
              linewidth: 1,
              visible: true,
              value: 3,
            },
            {
              color: 'rgba(29,161,26,0.3)',
              linestyle: 2,
              linewidth: 1,
              visible: true,
              value: -3,
            },
            {
              color: 'rgba(0,51,255,0.3)',
              linestyle: 2,
              linewidth: 1,
              visible: true,
              value: 2,
            },
            {
              color: 'rgba(0,51,255,0.3)',
              linestyle: 2,
              linewidth: 1,
              visible: true,
              value: -2,
            },
          ],
          precision: 0.1,
          inputs: { in_0: 240, in_1: 240, in_2: 'SMA' },
        },
        styles: {
          plot_0: {
            title: 'Sigma value',
            histogramBase: 0,
          },
          plot_1: {
            title: 'Sigma value',
            histogramBase: 0,
          },
        },
        bands: [
          { id: 'hline_0', name: 'UpperLimit' },
          { id: 'hline_1', name: 'LowerLimit' },
          { id: 'hline_2', name: 'LowerLimit' },
          { id: 'hline_3', name: 'LowerLimit' },
        ],
        inputs: [
          {
            id: 'in_0',
            name: 'MA Period',
            defval: 240,
            type: 'integer',
            min: 1,
            max: 2e3,
          },
          {
            id: 'in_1',
            name: 'Deviation length',
            defval: 240,
            type: 'integer',
            min: 1,
            max: 2e3,
          },
          {
            id: 'in_2',
            name: 'MA Type',
            defval: 'SMA',
            type: 'text',
            options: ['SMA', 'EMA', 'WMA'],
          },
        ],
      },
      constructor: function () {
        this.init = function (context, inputCallback) {};

        this.main = function (context, inputCallback) {
          this._context = context;
          this._input = inputCallback;
          this._context.new_var(0).get(3000);
          const maPeriod = this._input(0);
          const devLen = this._input(1);
          const maType = this._input(2);
          const close = this._context.new_var(PineJS.Std.close(this._context));
          const ma =
            maType == 'SMA'
              ? PineJS.Std.sma(close, maPeriod, this._context)
              : maType == 'EMA'
              ? PineJS.Std.ema(close, maPeriod, this._context)
              : PineJS.Std.wma(close, maPeriod, this._context);
          const deviation = this._context.new_var(
            close < ma
              ? ((ma - close) / ma) * 100 * -1
              : PineJS.Std.abs(((ma - close) / ma) * 100)
          );
          const sd = PineJS.Std.stdev(deviation, devLen, this._context);
          const pl = deviation / sd;
          return [pl > 0 ? pl : 0, pl < 0 ? pl : 0];
        };
      },
    },
  ]);
}
