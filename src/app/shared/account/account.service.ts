import { Injectable } from '@angular/core';
import { QueryObject, APIReply } from '../../base/api';
import { RestApiService } from '../rest-api.service';
import { AccountInventory,
  APIQueryAccountMsg,
  APIAccountReply,
  APIGetAccountBalanceMsg,
  BalanceInventory,
  APILogOutMsg,
  APIGetAccountBalanceReply,
  APIQueryUserMsg,
  APIUserReply
} from './api';
@Injectable()
export class AccountService {

  constructor(private api: RestApiService) { }
  query(qobj: QueryObject, callback: (accounts: AccountInventory[], total: number) => void) {
    const msg = new APIQueryAccountMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((result: APIAccountReply) => {
      if (result.success) {
        callback(result.inventories, result.total);
      }else {
        callback([], 0);
      }
    });
  }
  getAccountBalance(uuid: string, done: (balance) => void) {
    const msg = new APIGetAccountBalanceMsg();
    msg.accountUuid = uuid;
    return this.api.call(msg).subscribe((request: APIGetAccountBalanceReply) => {
      done(request.inventory);
    });
  }
  logout(sessionUuid: string, done: () => void) {
    const msg = new APILogOutMsg();
    msg.sessionUuid = sessionUuid;
    return this.api.call(msg).subscribe((request: APIReply) => {
      done();
    });
  }
  queryUser(qobj: QueryObject, callback: (users: any) => void) {
      const msg = new APIQueryUserMsg();
      msg.count = qobj.count === true;
      msg.start = qobj.start;
      msg.limit = qobj.limit;
      msg.fields = qobj.fields;
      msg.conditions = qobj.conditions ? qobj.conditions : [];
      return this.api.call(msg).subscribe((result: APIUserReply) => {
        if (result.success) {
          callback(result.inventories);
        }else {
          callback([]);
        }
      });
  }
}
