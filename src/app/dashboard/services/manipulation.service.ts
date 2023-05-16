import { Injectable } from '@angular/core';
import {
  GenericWebsocketService,
  ServiceTitle,
} from '@app/dashboard/services/generic-websocket.service';
import { environment } from '@environments/environment';
import { map, share } from 'rxjs';

export interface TopItem {
  corr: number;
  corrV: number;
  symbol: string;
  timestamp: number;
  side: string;
  probability: number;
}

interface TopItems {
  data: {
    [k: string]: TopItem;
  };
}

export function isTopItem(object: any): object is TopItem {
  return (
    'corr' in object &&
    'corrV' in object &&
    'symbol' in object &&
    'timestamp' in object
  );
}

@Injectable({
  providedIn: 'root',
})
export class ManipulationService extends GenericWebsocketService<TopItems> {
  constructor() {
    super(
      ServiceTitle.TopManipulations,
      environment.dictManipulationWsURL,
      environment.manipulationApiURL
    );
  }

  streamWithRetry$ = this.rawStreamWithRetry$.pipe(
    map((e) => e.data.data),
    share()
  );
}
