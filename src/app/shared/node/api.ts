import {
  APIQueryMsg,
  SessionInventory,
  APIPathFlag,
  APIReply,
  APIMessage
} from '../../base/api';
export class NodeInventory {
  name: string;
  uuid: string;
}
export class APIQueryNodeMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Tunnel;
  toApiMap(): any {
    return {
      'com.syscxp.header.tunnel.node.APIQueryNodeMsg': this
    };
  }
}
export class APINodeReply extends APIReply {
  inventories: Array<NodeInventory>;
  total: number;
}
export class APIListProvinceNodeMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Tunnel;
  toApiMap(): any {
    return {
      'com.syscxp.header.tunnel.node.APIListProvinceNodeMsg': this
    };
  }
}
export class ListProvinceNodeReply {
  provinces: Array<string>;
  success: boolean;
}
