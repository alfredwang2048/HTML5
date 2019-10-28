import {Injectable, Optional} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MsgService} from './message/msg.service';
import {of} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class MonitorService {
  private monitorAPIUrl = '/api/v2/query/';

  constructor(private http: HttpClient,
              @Optional() private msgService: MsgService) {
  }

  // vpe 链路监控
  vpeLinkMonitor(monitorSuffixPath: string, monitorCondition: Array<MonitorObject>) {
    return this.http.post(this.monitorAPIUrl + monitorSuffixPath, monitorCondition).pipe(
      catchError((error: any) => {
        return of([]);
      }));
  }
}

export class MonitorObject {
  start: number | string | Date;
  end: number | string | Date;
  metrics: Array<string>;
  tags: { [props: string]: any };
}
