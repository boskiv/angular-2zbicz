import { Injectable } from "@angular/core";
import { GenericWebsocketService, ServiceTitle, } from "@app/dashboard/services/generic-websocket.service";
import { environment } from "@environments/environment";

// {"delta":7324.27,"params":{"bbLength":100,"bbMult":3},"side":"UP","symbol":"SSVUSDT","timestamp":1680983078216}
export interface IStopKiller {
  delta: number;
  price: number;
  params: {
    bbLength: number;
    bbMult: number;
  };
  side: string;
  symbol: string;
  timestamp: number;
  isNew: boolean;
}

export function isStopKiller(object: any): object is IStopKiller {
  return (
    'delta' in object &&
    'price' in object &&
    'params' in object &&
    'side' in object &&
    'symbol' in object &&
    'timestamp' in object
  );
}

@Injectable({
  providedIn: 'root',
})
export class StopKillerService extends GenericWebsocketService<IStopKiller> {
  constructor() {
    super(
      ServiceTitle.StopKiller,
      environment.stopKillerWsURL,
      environment.stopKillerApiURL
    );
  }
}
