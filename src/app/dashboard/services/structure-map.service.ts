import { Injectable } from '@angular/core';
import {
  GenericWebsocketService,
  ServiceTitle,
} from '@app/dashboard/services/generic-websocket.service';
import { environment } from '@environments/environment';
import { map, scan, shareReplay } from 'rxjs';

export interface IStructureMap {
  data: {
    [k: string]: {
      fast: number;
      slow: number;
    };
  };
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class StructureMapService extends GenericWebsocketService<IStructureMap> {
  constructor() {
    super(ServiceTitle.StructureMap, environment.dictStructureMapWsURL);
  }

  streamWithRetry$ = this.rawStreamWithRetry$.pipe(
    map((e) => e.data.data),
    scan((acc, curr) => {
      Object.keys(curr).forEach((key) => {
        acc[key] = curr[key];
      });
      return acc;
    }),
    shareReplay(1)
  );
}
