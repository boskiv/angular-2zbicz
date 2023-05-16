import { Injectable } from '@angular/core';
import {
  GenericWebsocketService,
  ServiceTitle,
} from '@app/dashboard/services/generic-websocket.service';
import { environment } from '@environments/environment';

export interface IHiLow {
  chanel: 'WINDOW' | 'LEVEL' | 'NEAR LEVEL';
  level: 'MIN' | 'MAX';
  levelPrice: number;
  newLevelPrice?: number;
  prc: number;
  price: number;
  symbol: string;
  timestamp: number;
  weight: 'YEAR' | 'MONTH' | 'WEEK' | 'DAY';
}

@Injectable({
  providedIn: 'root',
})
export class HiLowService extends GenericWebsocketService<IHiLow> {
  constructor() {
    super(ServiceTitle.HiLow, environment.hiLowWsURL);
  }
}
