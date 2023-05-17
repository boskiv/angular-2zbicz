import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
} from '@angular/core';

import { IBinanceDepth } from '@app/dashboard/services/binance.service';
import {
  IStopKiller,
  StopKillerService,
} from '@app/dashboard/services/stopkiller.service';
import datafeed from '@app/utils/v2';
import { customZScore } from '@app/utils/v2/indicators/custom-z-score';
import { manipulationMonitor } from '@app/utils/v2/indicators/manipulation-monitor';
import { openInterest } from '@app/utils/v2/indicators/open-interest';
import { pairTrading } from '@app/utils/v2/indicators/pair-trading';
import { socialDominance } from '@app/utils/v2/indicators/social-dominance';
import { socialVolume } from '@app/utils/v2/indicators/social-volume';
import {
  ChartingLibraryWidgetOptions,
  CustomIndicator,
  EntityId,
  IChartingLibraryWidget,
  IChartWidgetApi,
  LanguageCode,
  PineJS,
  ResolutionString,
  widget,
} from '@assets/charting_library';
import { forEach } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'sf-tv-chart-container',
  templateUrl: './tv-chart-container.component.html',
  styleUrls: ['./tv-chart-container.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TvChartContainerComponent implements OnDestroy, AfterViewInit {
  private barColors = {
    up: '#089981',
    down: '#f23645',
  };

  private _symbol = 'BTCUSDT';
  private _interval: ChartingLibraryWidgetOptions['interval'] =
    '1' as ResolutionString;
  // BEWARE: no trailing slash is expected in feed URL
  private _datafeedUrl = 'https://demo_feed.tradingview.com';
  private _libraryPath: ChartingLibraryWidgetOptions['library_path'] =
    '/assets/charting_library/';
  private _chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'] =
    'https://save.ione.dev';
  private _chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'] =
    '1.1';
  private _clientId: ChartingLibraryWidgetOptions['client_id'] =
    'dev.spreadcharts.com';
  private _userId: ChartingLibraryWidgetOptions['user_id'] = 'public_user_id';
  private _fullscreen: ChartingLibraryWidgetOptions['fullscreen'] = false;
  private _autosize: ChartingLibraryWidgetOptions['autosize'] = true;
  public containerId: ChartingLibraryWidgetOptions['container'] =
    'id_' + Math.random();
  private _tvWidget: IChartingLibraryWidget | null = null;

  private subscriptions: Subscription[] = [];

  @Input()
  set datafeedUrl(datafeedUrl: string) {
    this._datafeedUrl = datafeedUrl || this._datafeedUrl;
  }

  @Input()
  set libraryPath(libraryPath: ChartingLibraryWidgetOptions['library_path']) {
    this._libraryPath = libraryPath || this._libraryPath;
  }

  @Input()
  set chartsStorageUrl(
    chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url']
  ) {
    this._chartsStorageUrl = chartsStorageUrl || this._chartsStorageUrl;
  }

  @Input()
  set chartsStorageApiVersion(
    chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version']
  ) {
    this._chartsStorageApiVersion =
      chartsStorageApiVersion || this._chartsStorageApiVersion;
  }

  @Input()
  set clientId(clientId: ChartingLibraryWidgetOptions['client_id']) {
    this._clientId = clientId || this._clientId;
  }

  @Input()
  set userId(userId: ChartingLibraryWidgetOptions['user_id']) {
    this._userId = userId || this._userId;
  }

  @Input()
  set fullscreen(fullscreen: ChartingLibraryWidgetOptions['fullscreen']) {
    this._fullscreen = fullscreen || this._fullscreen;
  }

  @Input()
  set autosize(autosize: ChartingLibraryWidgetOptions['autosize']) {
    this._autosize = autosize || this._autosize;
  }

  constructor(private stopKillerService: StopKillerService) {}
  ngAfterViewInit(): void {
    function getLanguageFromURL(): LanguageCode | null {
      const regex = new RegExp('[?&]lang=([^&#]*)');
      const results = regex.exec(location.search);

      return results === null
        ? null
        : (decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode);
    }

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: this._symbol,
      debug: false,
      datafeed,
      interval: this._interval,
      container: this.containerId,
      library_path: this._libraryPath,
      locale: getLanguageFromURL() || 'en',
      disabled_features: ['popup_hints', 'header_saveload'],
      enabled_features: [
        'study_templates',
        'hide_left_toolbar_by_default',
        'show_spread_operators',
        'study_overlay_compare_legend_option',
        'use_localstorage_for_settings',
        'two_character_bar_marks_labels',
      ],
      charts_storage_url: this._chartsStorageUrl,
      charts_storage_api_version: this._chartsStorageApiVersion,
      client_id: this._clientId,
      theme: 'Dark',
      overrides: {
        'paneProperties.background': '#292929',
        'paneProperties.backgroundType': 'solid',
      },
      user_id: this._userId,
      fullscreen: this._fullscreen,
      autosize: this._autosize,
      custom_indicators_getter: function (
        PineJS: PineJS
      ): Promise<CustomIndicator[]> {
        return Promise.resolve([
          socialDominance(PineJS),
          socialVolume(PineJS),
          manipulationMonitor(PineJS),
          openInterest(PineJS),
          customZScore(PineJS),
          pairTrading(PineJS),
        ]);
      },
      // custom_css_url: '../chart.css',
      // custom_indicators_getter: customIndicators,
    };

    this._tvWidget = new widget(widgetOptions);

    this._tvWidget.headerReady().then(() => {
      if (this._tvWidget) {
        this._tvWidget.addCustomCSSFile(
          'https://kit.fontawesome.com/b1b2e78000.css'
        );
        this._tvWidget.addCustomCSSFile('../chart.css');
        const button = this._tvWidget.createButton();
        button.setAttribute('title', 'My custom button tooltip');
        button.addEventListener('click', function () {
          alert('My custom button pressed!');
        });
        button.textContent = 'My custom button caption';
        button.innerHTML =
          '<i class=" font-white fa-light fa-face-awesome"></i>';
      }
    });

    this._tvWidget.onChartReady(() => {
      this._tvWidget?.applyOverrides({
        'paneProperties.background': '#1D1D1D',
        'paneProperties.backgroundType': 'solid',
      });
      this.getStopKillerShapes(this._tvWidget?.chart(), this._symbol);
      this._tvWidget
        ?.chart()
        .onSymbolChanged()
        .subscribe(null, () => {
          let symbol = this._tvWidget?.chart().symbol();
          if (symbol) {
            if (symbol.indexOf('BINANCE:') === 0) {
              symbol = symbol.replace('BINANCE:', '');
            }

            this.getStopKillerShapes(this._tvWidget?.chart(), symbol);

            this._symbol = symbol;
          }
        });
      this._tvWidget
        ?.chart()
        .onIntervalChanged()
        .subscribe(null, (interval) => {
          this._interval = interval;
          this.getStopKillerShapes(this._tvWidget?.chart(), this._symbol);

          this._interval = interval;
        });
    });
  }

  priceBuyMapDepth: {
    [key: string]: {
      price: number;
      volume: number;
      color: string;
      startTime: number;
      endTime: number;
      entityID?: EntityId;
    };
  } = {};
  priceSellMapDepth: {
    [key: string]: {
      price: number;
      volume: number;
      color: string;
      startTime: number;
      endTime: number;
      entityID?: EntityId;
    };
  } = {};

  updateDepthMap(data: IBinanceDepth) {
    this.cleanDepthMap(data);
    for (let [price, volume] of data.a) {
      if (this.priceBuyMapDepth[price]) {
        this.priceBuyMapDepth[price].endTime = data.E / 1000;
      } else {
        this.priceBuyMapDepth[price] = {
          color: this.barColors.up,
          price: parseFloat(price),
          volume: parseFloat(volume),
          startTime: data.E / 1000,
          endTime: data.E / 1000,
        };
      }
    }
    for (let [price, volume] of data.b) {
      if (this.priceSellMapDepth[price]) {
        this.priceSellMapDepth[price].endTime = data.E / 1000;
      } else {
        this.priceSellMapDepth[price] = {
          color: this.barColors.down,
          price: parseFloat(price),
          volume: parseFloat(volume),
          startTime: data.E / 1000,
          endTime: data.E / 1000,
        };
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((e) => e.unsubscribe());
    if (this._tvWidget !== null) {
      this._tvWidget.remove();
      this._tvWidget = null;
    }
  }

  private cleanDepthMap(data: IBinanceDepth) {
    const pricesBuy = data.a.map((value) => {
      return value[0];
    });
    const pricesSell = data.b.map((value) => {
      return value[0];
    });
    forEach(this.priceBuyMapDepth, (value, key) => {
      if (!pricesBuy.includes(key)) {
        this.removeLine(value.entityID);
        delete this.priceBuyMapDepth[key];
      }
    });
    forEach(this.priceSellMapDepth, (value, key) => {
      if (!pricesSell.includes(key)) {
        this.removeLine(value.entityID);
        delete this.priceSellMapDepth[key];
      }
    });
  }

  private removeLine(entityID: EntityId | undefined) {
    if (entityID) {
      this._tvWidget?.chart().removeEntity(entityID);
    }
  }

  private getStopKillerShapes(
    chart: IChartWidgetApi | undefined,
    symbol: string
  ) {
    if (!(this._interval == '1' || this._interval == '5')) {
      console.log('interval is not supported', this._interval);
      chart?.getAllShapes().forEach((shape) => {
        chart?.removeEntity(shape.id);
      });
      return;
    }

    chart?.getAllShapes().forEach((shape) => {
      chart?.removeEntity(shape.id);
    });
    let range = chart?.getVisibleRange();
    this.stopKillerService
      .getWithParams({
        symbol: symbol,
        startTime: Number(range?.from) * 1000,
        endTime: Number(range?.to) * 1000,
      })
      .subscribe((data) => {
        console.log('stop killer data', data);

        if (data.length > 0) {
          data.forEach((sk: IStopKiller) => {
            chart?.createShape(
              {
                time: Math.floor(sk.timestamp / 1000),
                price: sk.price,
                // channel: sk.side === 'UP' ? 'high' : 'low',
              },
              {
                shape: sk.side === 'DOWN' ? 'arrow_up' : 'arrow_down',
                lock: true,
                overrides: {
                  color: '#ffffff',
                  fontsize: 9,
                },
                showInObjectsTree: false,
                filled: true,
                text: `${sk.price}`,
                zOrder: 'top',
              }
            );
          });
        }
      });
  }
}
