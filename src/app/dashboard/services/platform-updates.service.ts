import { Injectable } from '@angular/core';
import {
  GenericWebsocketService,
  ServiceTitle,
} from '@app/dashboard/services/generic-websocket.service';
import { environment } from '@environments/environment';

interface Photo {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
}

export interface PlatformUpdate {
  chat_id: number;
  chat_title: string;
  text: string;
  caption: string;
  photos: Photo[];
}

@Injectable({
  providedIn: 'root',
})
export class PlatformUpdatesService extends GenericWebsocketService<PlatformUpdate> {
  constructor() {
    super(
      ServiceTitle.platformUpdates,
      environment.sfNewsWsURL,
      environment.sfNewsApiURL
    );
  }
}
