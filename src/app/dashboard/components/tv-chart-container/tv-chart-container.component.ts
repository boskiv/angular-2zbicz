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

  private _symbol = 'ADAUSDT';
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

  constructor() {}
  ngAfterViewInit(): void {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: this._symbol,
      debug: false,
      datafeed,
      interval: this._interval,
      container: this.containerId,
      library_path: this._libraryPath,
      locale: 'en',
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
    };

    this._tvWidget = new widget(widgetOptions);
    this._tvWidget.onChartReady(() => {
      this._tvWidget?.applyOverrides({
        'paneProperties.background': '#1D1D1D',
        'paneProperties.backgroundType': 'solid',
      });
      this._tvWidget?.chart().createStudy('Manipulation Monitor', false, false);
    
    });
  }

  ngOnDestroy() {
    if (this._tvWidget !== null) {
      this._tvWidget.remove();
      this._tvWidget = null;
    }
  }
}
