import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { IManipulation } from '@app/dashboard/components/manipulation-monitor-pane/manipulation-monitor-pane.component';
import { DecryptService } from '@app/dashboard/services/decryptor.service';
import { INewsObject } from '@app/dashboard/services/news.service';
import { ISpike } from '@app/dashboard/services/spike.service';
import { IStopKiller } from '@app/dashboard/services/stopkiller.service';
import { IStructureMap } from '@app/dashboard/services/structure-map.service';
import { IVolumeActivity } from '@app/dashboard/services/volume-activity.service';
import { environment } from '@environments/environment';
import {
  BehaviorSubject,
  filter,
  mergeMap,
  Observable,
  shareReplay,
} from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

export enum ServiceTitle {
  TopManipulations = 'Manipulations',
  LiveStrategies = 'Live Strategies',
  HiLow = 'Hi Low',
  StopKiller = 'Stop Killer',
  VolumeActivity = 'Volume Activity',
  News = 'News',
  StructureMap = 'Structure Map',
  Guide = 'Guide',
  TickIndex = 'Tick Index',
  platformUpdates = 'Platform Updates',
}

export enum ResponseType {
  HeartBeat = 'heartbeat',
  hiLow = 'hiLowScanners',
  ManipulationMonitors = 'manipulationMonitors',
  LiveStrategies = 'liveStrategies',
  StopKillers = 'stopKillers',
  Strategies = 'strategies',
  VolumeActivity = 'volumeActivity',
  News = 'news',
  StructureMap = 'structMapAvgs',
  Guide = 'guide',
  TickIndex = 'tickIndex',
  platformUpdates = 'platformUpdates',
}

export interface IGenericRequestParams {
  symbol?: string;
  limit?: number;
  startTime?: number;
  endTime?: number;
  isPrc?: boolean;
  isDesc?: boolean;
  isLast?: boolean;
}

export type IHeartBeat = {
  request: string;
  response?: string;
};

export interface IGenericResponse<
  T = IManipulation &
    IStructureMap &
    IVolumeActivity &
    INewsObject &
    IStopKiller &
    ISpike &
    IHeartBeat
> {
  type: ResponseType;
  encrypted: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export abstract class GenericWebsocketService<T> implements OnDestroy {
  connected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private socket$ = webSocket<IGenericResponse<T>>({
    url: this.websocketURL,
    openObserver: {
      next: () => {
        if (!environment.production)
          if (!environment.production)
            console.log(`connected to ${this.title} websocket server`);
        this.connected$.next(true);
      },
      error: (err) => {
        if (!environment.production)
          if (!environment.production)
            console.log(
              `error connecting to ${this.title} websocket server`,
              err
            );
        this.connected$.next(false);
      },
    },
    closeObserver: {
      next: () => {
        if (!environment.production)
          if (!environment.production)
            console.log(`disconnected from ${this.title} websocket server`);
        this.connected$.next(false);
      },
    },
  });
  private _rawStreamWithRetry$!: Observable<IGenericResponse<T>>;
  protected httpClient = inject(HttpClient);
  protected decryptService = inject(DecryptService);
  protected constructor(
    private title: string,
    private websocketURL: string,
    private apiURL?: string
  ) {
    setInterval(() => {
      if (!this.socket$.closed) {
        // @ts-ignore
        this.socket$.next('ping');
      }
    }, 30000);
  }

  get rawStreamWithRetry$(): Observable<IGenericResponse<T>> {
    if (!this._rawStreamWithRetry$) {
      this._rawStreamWithRetry$ = this.socket$.pipe(
        filter((data) => data.type !== ResponseType.HeartBeat),
        mergeMap((data) => {
          return this.decryptService.decrypt<T>(data);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this._rawStreamWithRetry$;
  }

  get getAll(): Observable<T[]> {
    if (!this.apiURL) throw new Error('apiURL is not defined');
    return this.httpClient.get<T[]>(this.apiURL);
  }

  getWithParams(requestParams?: IGenericRequestParams): Observable<T[]> {
    if (!this.apiURL) throw new Error('apiURL is not defined');
    let params = new HttpParams();
    if (requestParams) {
      if (requestParams.symbol) {
        params = params.set('symbol', requestParams.symbol);
      }
      if (requestParams.startTime) {
        params = params.set('startTime', requestParams.startTime.toString());
      }
      if (requestParams.endTime) {
        params = params.set('endTime', requestParams.endTime.toString());
      }
      if (requestParams.limit) {
        params = params.set('limit', requestParams.limit.toString());
      }
      if (requestParams.isPrc) {
        params = params.set('isPrc', 'true');
      }
      if (requestParams.isDesc) {
        params = params.set('isDesc', 'true');
      }
      if (requestParams.isLast) {
        params = params.set('isLast', 'true');
      }
    }
    return this.httpClient.get<T[]>(this.apiURL, {
      params: params,
    });
  }

  ngOnDestroy(): void {
    this.socket$.complete();
  }
}
