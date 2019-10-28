import { Injectable } from '@angular/core';
import {RestApiService} from '../rest-api.service';
import {MsgService} from '../message/msg.service';
import {QueryObject} from '../../base';
import {
  CeModelInventory,
  CePortModelInventory,
  APIQueryCeModelMsg,
  APIQueryCeModelReply,
  APIQueryCePortModelMsg,
  APIQueryCePortModelReply
} from './api';

@Injectable()
export class CeModelService {

  constructor(
    private api: RestApiService,
    private msgService: MsgService,
  ) { }

  query(qobj: QueryObject, callback: (lists: CeModelInventory[], total: number) => void) {
    const msg = new APIQueryCeModelMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIQueryCeModelReply) => {
      if (rst.success && rst.total) {
        callback(rst.inventories, rst.total);
      }else {
        callback([], 0);
      }
    });
  }
  queryPort(qobj: QueryObject, callback: (lists: CePortModelInventory[], total: number) => void) {
    const msg = new APIQueryCePortModelMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIQueryCePortModelReply) => {
      if (rst.success && rst.total) {
        callback(rst.inventories, rst.total);
      }else {
        callback([], 0);
      }
    });
  }
}
