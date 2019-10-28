import { Injectable } from '@angular/core';
import { RestApiService } from '../rest-api.service';
import { QueryObject } from '../../base/api';
import {
  TunnelInventory,
  APIQueryTunnelMsg,
  APITunnelReply,
  APIEndpointReply,
  APIQueryL3EndpointMsg,
  APIListTunnelPortMsg, APIQueryEndpointMsg
} from './api';
@Injectable()
export class TunnelService {

  constructor(private api: RestApiService) { }
  query(qobj: QueryObject, callback: (tunnels: TunnelInventory[], total: number) => void) {
    const msg = new APIQueryTunnelMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APITunnelReply) => {
      if (rst.success) {
        callback(rst.inventories, rst.total);
      }else {
        callback([], 0);
      }
    });
  }

  queryL3Endpoint(qobj: QueryObject, callback: (datas: any, total: number) => void) {
    const msg = new APIQueryL3EndpointMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIEndpointReply) => {
      if (rst.success) {
        callback(rst.inventories, rst.total);
      }else {
        callback([], 0);
      }
    });
  }

  queryEndpoint(qobj: QueryObject, callback: (datas: any, total: number) => void) {
    const msg = new APIQueryEndpointMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIEndpointReply) => {
      if (rst.success) {
        callback(rst.inventories, rst.total);
      }else {
        callback([], 0);
      }
    });
  }

  getPorts(uuid: string, callback: (datas: any) => void) {
    const msg = new APIListTunnelPortMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        callback(rst.inventories);
      }else {
        callback([]);
      }
    });
  }
}
