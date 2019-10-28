import { Injectable } from '@angular/core';
import {RestApiService} from '../rest-api.service';
import {QueryObject} from '../../base';
import { APIQueryVpnLinkMonitorVOMsg, APIQueryVpnLinkMonitorReply, VPELinkMonitorInventory } from './api';
@Injectable()
export class LinkMonitorService {

  constructor(
    private api: RestApiService
  ) { }

  query(qobj: QueryObject, callback: (lists: VPELinkMonitorInventory[], total: number) => void, OnlyCount = false) {
    const msg = new APIQueryVpnLinkMonitorVOMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIQueryVpnLinkMonitorReply) => {
      if(OnlyCount == true){
        callback([], rst.total)
      }else {
      const ces = rst.inventories;
      if (rst.success && ces && ces.length) {
        callback(ces, rst.total);
      } else {
        callback([], 0);
      }}
    });
  }
}
