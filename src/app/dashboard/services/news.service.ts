import { Injectable } from '@angular/core';
import {
  GenericWebsocketService,
  ServiceTitle,
} from '@app/dashboard/services/generic-websocket.service';
import { environment } from '@environments/environment';

export interface INewsObject {
  kind: string;
  domain: string;
  votes: {
    negative: number;
    positive: number;
    important: number;
    liked: number;
    disliked: number;
    lol: number;
    toxic: number;
    saved: number;
    comments: number;
  };
  source: {
    title: string;
    region: string;
    domain: string;
    path: string;
  };
  metadata: {
    description: string;
    image: string;
  };
  title: string;
  published_at: string;
  humanized_time: string;
  slug: string;
  currencies: {
    code: string;
    title: string;
    slug: string;
    url: string;
  }[];
  id: number;
  url: string;
  created_at: string;
}

export function isNewsObject(object: any): object is INewsObject {
  return (
    'kind' in object &&
    'domain' in object &&
    'votes' in object &&
    'source' in object &&
    'metadata' in object &&
    'title' in object &&
    'published_at' in object &&
    'humanized_time' in object &&
    'slug' in object &&
    'currencies' in object &&
    'id' in object &&
    'url' in object &&
    'created_at' in object
  );
}

@Injectable({
  providedIn: 'root',
})
export class NewsService extends GenericWebsocketService<INewsObject> {
  constructor() {
    super(ServiceTitle.News, environment.newsWsURL, environment.newsApiURL);
  }
}
