import { Injectable } from '@angular/core';
import {RestApiService} from '../rest-api.service';
import {MsgService} from '../message/msg.service';
import {QueryObject} from '../../base';
import {APIQueryRyuMonitorMsg, RyuMonitorInventory, APIQueryRyuReply} from './api';

@Injectable()
export class RyuService {

  constructor(
    private api: RestApiService,
    private msgService: MsgService,
  ) { }

  query(qobj: QueryObject, callback: (lists: RyuMonitorInventory[], total: number) => void) {
    const msg = new APIQueryRyuMonitorMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIQueryRyuReply) => {
      if (rst.success && rst.total) {
        callback(rst.inventories, rst.total);
      }else {
        callback([], 0);
      }
    });
  }
}
