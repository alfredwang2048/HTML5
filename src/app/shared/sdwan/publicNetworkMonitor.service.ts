import {Injectable} from '@angular/core';
import {RestApiService} from '../rest-api.service';
import {QueryObject} from '../../base';
import {APIQueryVpeIpInfoMsg, IpInfoInventory, APIVpeIpInfoReply} from './api';

@Injectable()
export class PublicNetworkMonitorService {

  constructor(private api: RestApiService) {
  }

  query(qobj: QueryObject, callback: (lists: IpInfoInventory[], total: number) => void) {
    const msg = new APIQueryVpeIpInfoMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIVpeIpInfoReply) => {
      const ces = rst.inventories;
      if (rst.success && ces && ces.length) {
        callback(ces, rst.total);
      } else {
        callback([], 0);
      }
    });
  }
}
