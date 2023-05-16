import { Injectable } from "@angular/core";
import { GenericWebsocketService, ServiceTitle, } from "@app/dashboard/services/generic-websocket.service";
import { environment } from "@environments/environment";

// {"timestamp":1681640159452,"symbol":"UNFIUSDT","ping":38,"volume":137461.5,"volumeSum":5496667.5,"price":5.705}
export interface IVolumeActivity {
  timestamp: number;
  symbol: string;
  ping: number;
  volume: number;
  volumeSum: number;
  volumePingPrc: number;
  volumeSumPrc: number;
  price: number;
}

export function isVolumeActivity(object: any): object is IVolumeActivity {
  return (
    'timestamp' in object &&
    'symbol' in object &&
    'ping' in object &&
    'volume' in object &&
    'volumeSum' in object &&
    'volumePingPrc' in object &&
    'volumeSumPrc' in object &&
    'price' in object
  );
}
@Injectable({
  providedIn: 'root',
})
export class VolumeActivityService extends GenericWebsocketService<IVolumeActivity> {
  constructor() {
    super(
      ServiceTitle.VolumeActivity,
      environment.prePumpDetectorWS,
      environment.prePumpDetectorURL
    );
  }
}
