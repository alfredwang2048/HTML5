import {  APIMessage,
  APIQueryMsg,
  SessionInventory,
  APIPathFlag,
  APIReply } from '../../base/api';
export class TunnelInventory {
  uuid: string;
  name: string;
  tunnelSwitchs: Array<any>;
}
export class APIQueryTunnelMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Tunnel;
  toApiMap(): any {
    return {
      'com.syscxp.header.tunnel.tunnel.APIQueryTunnelMsg': this
    };
  }
}
export class APITunnelReply extends APIReply {
  inventories: Array<TunnelInventory>;
  total: number;
}

export class APIQueryL3EndpointMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Tunnel;
  toApiMap(): any {
    return {
      'com.syscxp.header.tunnel.network.APIQueryL3EndpointMsg': this
    };
  }
}
export class APIEndpointReply extends APIReply {
  inventories: Array<TunnelInventory>;
  total: number;
}

export class APIListTunnelPortMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  uuid: string;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIListTunnelPortMsg': this
    };
  }
}
export class APIQueryEndpointMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Tunnel;
  toApiMap(): any {
    return {
      'com.syscxp.header.tunnel.endpoint.APIQueryEndpointMsg': this
    };
  }
}
