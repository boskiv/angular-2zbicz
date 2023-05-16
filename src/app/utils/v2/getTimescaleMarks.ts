import { INewsObject } from '@app/dashboard/services/news.service';
import {
  GetMarksCallback,
  LibrarySymbolInfo,
  ResolutionString,
  TimescaleMark,
} from '@assets/charting_library';
import { environment } from '@environments/environment';
import { from as rxjsFrom, Observable } from 'rxjs';

export const getTimescaleMarks = (
  symbolInfo: LibrarySymbolInfo,
  startDate: number,
  endDate: number,
  onDataCallback: GetMarksCallback<TimescaleMark>,
  resolution: ResolutionString
) => {
  let currency = symbolInfo.name.split('USDT')[0].split('BUSD')[0];
  let news$: Observable<INewsObject[]> = rxjsFrom(
    fetch(
      environment.newsApiURL +
        '?symbol=' +
        currency +
        '&startTime=' +
        startDate * 1000
    ).then((res) => res.json())
  );

  news$.subscribe((news) => {
    let marks: TimescaleMark[] = [];
    marks = news.map((n) => {
      return {
        id: n.id,
        time: new Date(n.published_at).getTime() / 1000,
        color: 'green',
        shape: 'earning',
        label: 'N',
        tooltip: [n.title],
      };
    });
    onDataCallback(marks);
  });
};
