import { Injectable } from '@angular/core';
import { RestApiService } from '../rest-api.service';
import { QueryObject } from '../../base/api';
import { NodeInventory,
  APIQueryNodeMsg,
  APIListProvinceNodeMsg,
  APINodeReply,
  ListProvinceNodeReply} from './api';
@Injectable()
export class NodeService {

  constructor(private api: RestApiService) { }
  query(qobj: QueryObject, callback: (nodes: NodeInventory[], total: number) => void) {
    const msg = new APIQueryNodeMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((result: APINodeReply) => {
      if (result.success) {
        callback(result.inventories, result.total);
      }else {
        callback([], 0);
      }
    });
  }
  listProvince(callback: (provinces: string[]) => void) {
    const msg = new APIListProvinceNodeMsg();
    return this.api.call(msg).subscribe((result: ListProvinceNodeReply) => {
      if (result.success) {
        callback(result.provinces);
      }else {
        callback([]);
      }
    });
  }
}
