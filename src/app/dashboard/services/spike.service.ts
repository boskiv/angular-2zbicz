import { Injectable } from '@angular/core';
import {
  GenericWebsocketService,
  ServiceTitle,
} from '@app/dashboard/services/generic-websocket.service';
import { SoundService } from '@app/dashboard/services/sound.service';
import { environment } from '@environments/environment';

export interface ISpike {
  timestamp: number;
  isNew: boolean;
  symbol: string;
  direction: string;
  probability: number;
  params: {
    bbLength: number;
    bbMult: number;
  };
}

export function isSpike(object: any): object is ISpike {
  return (
    'timestamp' in object &&
    'symbol' in object &&
    'direction' in object &&
    'probability' in object &&
    'params' in object
  );
}

@Injectable({
  providedIn: 'root',
})
export class SpikeService extends GenericWebsocketService<ISpike> {
  constructor(private soundService: SoundService) {
    super(
      ServiceTitle.LiveStrategies,
      environment.spikeWsURL,
      environment.spikeApiURL
    );
  }
}
