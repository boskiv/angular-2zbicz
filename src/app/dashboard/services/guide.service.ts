import { Injectable } from '@angular/core';
import {
  GenericWebsocketService,
  ServiceTitle,
} from '@app/dashboard/services/generic-websocket.service';
import { environment } from '@environments/environment';

export interface IGuide {
  timestamp: number;
  v1: number;
  v2: number[];
}

@Injectable({
  providedIn: 'root',
})
export class GuideService extends GenericWebsocketService<IGuide> {
  constructor() {
    super(ServiceTitle.Guide, environment.guidedWsURL);
  }
}
