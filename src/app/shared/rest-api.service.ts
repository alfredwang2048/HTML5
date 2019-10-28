import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';
import { mergeMap, catchError, last, delay, map } from 'rxjs/operators';
import { WCookiesService } from './w-cookies.service';
import { WindowService } from './window.service';
import { MsgService } from './message/msg.service';
import { APIMessage,
  APIPathFlag,
  SessionInventory,
  Receipt,
  APIReply } from '../base/api';
@Injectable()
export class RestApiService {
  private accountPath = '/account/api';
  private sdwanPath = '/sdwan/api';
  private tunnelPath = '/tunnel/api';
  private billingPath = '/billing/api';
  private spmPath = '/spm/api';
  private alarmPath = '/alarm/api';
  private statusDone = 'Done';
  private statusProcessing = 'Processing';
  private session: SessionInventory = new SessionInventory();
  constructor(private http: HttpClient,
              private cookie: WCookiesService,
              private window: WindowService,
              @Optional() private msgService: MsgService) { }
              mfaObservable: Subject<any> = new Subject();
              mfaMessageObservable: Subject<any>;
  /*
   * 不同的api存放地址不同
   */
  getUrl(msg: APIMessage, id?: string) {
    const suffix = id ? '/result/' + id : '';
    if (msg.flag === APIPathFlag.Account) {
      return this.accountPath + suffix;
    }else if (msg.flag === APIPathFlag.Tunnel) {
      return this.tunnelPath + suffix;
    }else if (msg.flag === APIPathFlag.Billing) {
      return this.billingPath + suffix;
    }else if (msg.flag === APIPathFlag.Sdwan) {
      return this.sdwanPath + suffix;
    }else if (msg.flag === APIPathFlag.Spm) {
      return this.spmPath + suffix;
    }else if (msg.flag === APIPathFlag.Alarm) {
      return this.alarmPath + suffix;
    }
  }
  /*
   * 获取对象第一个键对应的值
   * 请求response
   * {
   * state: 'Done',
   * result: {
   * "com.syscxp.account.header.ticket.APIQueryTicketReply":{"inventories":[],total:0,success: true}
   * }
   * }
   * 最后要获取的结果是result里面的第一个键对应的值
   */
  firstItem(obj: Object) {
    return obj[Object.keys(obj)[0]];
  }
  toLogin() {
    this.window.location.href = '/boss/account/#/login';
  }
  call(msg: APIMessage): Observable<any> {
    this.session.uuid = this.cookie.get('sessionid');
    if (!msg.session) {
      msg.session = new SessionInventory();
      msg.session.uuid = this.session.uuid;
    }
    if (!this.session.uuid) {
      this.toLogin();
    }
    const path = this.getUrl(msg);
    return this.http.post(path, msg.toApiMap()).pipe(
      mergeMap((response: Receipt) => {
        if (response.state === this.statusProcessing) {
          response.request = msg;
          return this.poll(msg, response);
        } else if (response.state === this.statusDone) {
          const reply: APIReply = this.firstItem(JSON.parse(response.result));
          if (!reply.success) {
            if (reply.error) {
              if (reply.error.code === 'ID.1001') {
                this.msgService.addMessage({type: 'error', msg: '认证失败'});
                this.toLogin();
              }else if (reply.error.code === 'ID.1002') {
                this.msgService.addMessage({type: 'error', msg: '权限不足'});
              }else if (reply.error.code === 'ID.2000') {
                // mfa
                this.mfaMessageObservable = new Subject();
                this.mfaObservable.next(msg);
                return this.mfaMessageObservable;
              }else {
                this.msgService.addMessage({type: 'error', msg: reply.error.details || reply.error.description});
              }
            }
          }

          return of(reply);
        }
      }),
      catchError((error: any) => {
        if (error.error instanceof ErrorEvent) {
          this.msgService.addMessage({type: 'error', msg: error.error.message});
        } else {
          this.msgService.addMessage({type: 'error', msg: error.message});
        }
        return of(error);
      })
    );
  }

  poll(msg: APIMessage, receipt: Receipt): Observable<any> {
    const path = this.getUrl(msg, receipt.uuid);
    return this.http.get(path).pipe(
      delay(1000),
      mergeMap((response: Receipt) => {
        if (response.state === this.statusProcessing) {
          return this.poll(msg, receipt);
        } else if (response.state === this.statusDone) {
          const reply: APIReply = this.firstItem(JSON.parse(response.result));
          if (!reply.success) {
            if (reply.error) {
              if (reply.error.code === 'ID.1001') {
                this.msgService.addMessage({type: 'error', msg: '认证失败'});
                this.toLogin();
              }else if (reply.error.code === 'ID.1002') {
                this.msgService.addMessage({type: 'error', msg: '权限不足'});
              }else if (reply.error.code === 'ID.2000') {
                // mfa
                this.mfaMessageObservable = new Subject();
                this.mfaObservable.next(msg);
                return this.mfaMessageObservable;
              }else {
                this.msgService.addMessage({type: 'error', msg: reply.error.details || reply.error.description});
              }
            }
          }
          return of(reply);
        }
      }),
      //last(),
      catchError((error: any) => {
        if (error.error instanceof ErrorEvent) {
          this.msgService.addMessage({type: 'error', msg: error.error.message});
        } else {
          this.msgService.addMessage({type: 'error', msg: error.message});
        }
        return of(error);
      })
    );
  }
}
