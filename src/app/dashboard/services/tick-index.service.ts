import { Injectable } from "@angular/core";
import { GenericWebsocketService, ServiceTitle, } from "@app/dashboard/services/generic-websocket.service";
import { environment } from "@environments/environment";

// {"sma":44.613333,"tickIndex":156,"timestamp":1683232297415,"window":300}%
export interface ITickIndex {
  sma: number;
  tickIndex: number;
  timestamp: number;
  window: number;
}

@Injectable({
  providedIn: 'root',
})
export class TickIndexService extends GenericWebsocketService<ITickIndex> {
  constructor() {
    super(ServiceTitle.TickIndex, environment.tickIndexWsURL);
  }
}
