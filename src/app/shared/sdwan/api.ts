import {APIMessage, APIPathFlag, APIQueryMsg, APIReply, SessionInventory} from '../../base';
import {ConnectionMode} from '../../model/utils';

// SD-WAN 网络
export class SdwanInventory {
  uuid: string;
  sdwanNetworkUuid: string;
  name: string;
  accountName: string;
  accountUuid: string;
  l3networkUuid: string;
  cidr: string;
  vid: string;
  companyName: string;
  ceNum: number;
  onlineCeNum: number;
  offlineCeNum: number;
  createDate: string;
  lastOpDate: string;
  purpose: string;
  description: string;
  distribution: string;
  vpeUuids: Array<string>;
}

export class APIQuerySdwanNetworkMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APIQuerySdwanNetworkMsg': this
    };
  }
}

export class APISdwanNetworkReply extends APIReply {
  inventories: Array<SdwanInventory>;
  total: number;
}

export class APIQuerySdwanCertMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APIQuerySdwanCertMsg': this
    };
  }
}

export class APIQueryBandwidthOfferingMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APIQueryBandwidthOfferingMsg': this
    };
  }
}

export class APICreateSdwanNetworkMsg extends APIMessage {
  accountUuid: string;
  l3networkUuid: string;
  name: string;
  description: string;
  cidr: string;
  purpose: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APICreateSdwanNetworkMsg': this
    };
  }
}

export class APISdwanNetworkEvent extends APIReply {
  inventory: SdwanInventory;
}

export class APIUpdateSdwanNetworkMsg extends APIMessage {
  uuid: string;
  name: string;
  description: string;
  purpose: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APIUpdateSdwanNetworkMsg': this
    };
  }
}

export class APIDeleteSdwanNetworkMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APIDeleteSdwanNetworkMsg': this
    };
  }
}

export class APIAssignVpeForSdwanMsg extends APIMessage {
  sdwanNetworkUuid: string;
  distribution: string;
  vpeUuids: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APIAssignVpeForSdwanMsg': this
    };
  }
}

export class APIQueryL3NetworkMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Tunnel;

  toApiMap(): any {
    return {
      'com.syscxp.header.tunnel.network.APIQueryL3NetworkMsg': this
    };
  }
}

export class ErrorCode {
  code: string;
  description: string;
  details: string;
  elaboration: string;
  cause: ErrorCode;
}

export class APIQueryResourceManagerRoleMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.managerRole.APIQueryResourceManagerRoleMsg': this
    };
  }
}

export class APIQueryManagerRoleReply {
  inventories: any;
  total: number;
  success: boolean;
  error: ErrorCode;
}

export class APISetResourceManagerRoleMsg extends APIMessage {
  flag = APIPathFlag.Sdwan;
  session: SessionInventory;
  resourceUuid: string;
  resourceType: string;
  businessUserUuid: string;
  projectUserUuid: string;
  customerUserUuid: string;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.managerRole.APISetResourceManagerRoleMsg': this
    };
  }
}

export class APISetResourceManagerEvent extends APIReply  {
  inventory: any;
  success: boolean;
}

export class APIQueryAccountManagerRoleMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Account;

  toApiMap(): any {
    return {
      'com.syscxp.account.header.managerRole.APIQueryAccountManagerRoleMsg': this
    };
  }
}

export class APIListVpeForSdwanMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  uuid: string;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APIListVpeForSdwanMsg': this
    };
  }
}

/**
 * VPE
 */
export class VpeInventory {
  uuid: string;
  name: string;
  code: string;
  nodeUuid: string;
  nodeName: string;
  country: string;
  province: string;
  city: string;
  address: string;
  manageIp: string;
  sshPort: number;
  startPort: number;
  username: string;
  password: string;
  state: string;
  status: string;
  number: number;
  type: string;
  createDate: string;
  lastOpDate: string;
  ipInfoInventories: Array<IpInfoInventory>;
  interfaceInventories: Array<InterfaceInventory>;
  // 拓扑属性
  x?: number;
  y?: number;
  color?: string;
  iconClass: string;
  topoType: string;
  masterOfCpeNum: number;
}

export class APIVpeReply extends APIReply {
  inventories: Array<VpeInventory>;
  total: number;
}

export class APIVpeEvent extends APIReply {
  inventory: VpeInventory;
}

export class APIQueryVpeMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIQueryVpeMsg': this
    };
  }
}

export class APICreateVpeMsg extends APIMessage {
  name: string;
  code: string;
  nodeUuid: string;
  address: string;
  manageIp: string;
  sshPort: number;
  username: string;
  password: string;
  type: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APICreateVpeMsg': this
    };
  }

}

export class APIUpdateVpeMsg extends APIMessage {
  uuid: string;
  name: string;
  address: string;
  manageIp: string;
  sshPort: string|number;
  username: string;
  password: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIUpdateVpeMsg': this
    };
  }
}

export class APIEnableVpeMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIEnableVpeMsg': this
    };
  }
}

export class APIDisableVpeMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIDisableVpeMsg': this
    };
  }
}

export class APIDeleteVpeMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIDeleteVpeMsg': this
    };
  }
}

export class APIReconnectVpeMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIReconnectVpeMsg': this
    };
  }
}

// 查询可用连接点的地区
export class APIListProvinceNodeMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Tunnel;

  toApiMap(): any {
    return {
      'com.syscxp.header.tunnel.node.APIListProvinceNodeMsg': this
    };
  }
}

// 查询已指定过的VPE
export class APIGetUsedVpesMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APIGetUsedVpesMsg': this
    };
  }
}

// 查询CE接入数量
export class APIGetCeNumOnVpeMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  uuid: string;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIGetCeNumOnVpeMsg': this
    };
  }
}

// 查询连接点
export class APIQueryEndpointMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Tunnel;

  toApiMap(): any {
    return {
      'com.syscxp.header.tunnel.endpoint.APIQueryEndpointMsg': this
    };
  }
}

// 查询交换机
export class APIQuerySwitchMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Tunnel;

  toApiMap(): any {
    return {
      'com.syscxp.header.tunnel.switchs.APIQuerySwitchMsg': this
    };
  }
}

// 查询交换机端口
export class APIQuerySwitchPortMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Tunnel;

  toApiMap(): any {
    return {
      'com.syscxp.header.tunnel.switchs.APIQuerySwitchPortMsg': this
    };
  }
}

/**
 * VPE--设置公线网络
 */
export class IpInfoInventory {
  uuid: string;
  vpeUuid: string;
  vpeName: string;
  vpeManageIp: string;
  interfaceName: string;
  netmask: string;
  gateway: string;
  bandwidth: number;
  usedBandwidth: number;
  bandwidthRatio: any;
  availableBandwidth: number;
  type: string;
  typeName: string;
  publicIp: string;
  createDate: string;
  lastOpDate: string;
}

export class APIVpeIpInfoReply extends APIReply {
  inventories: Array<IpInfoInventory>;
  total: number;
}

export class APIVpeIpInfoEvent extends APIReply {
  inventory: IpInfoInventory;
}

export class APIQueryVpeIpInfoMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIQueryVpeIpInfoMsg': this
    };
  }
}

export class APICreateVpeIpInfoMsg extends APIMessage {
  vpeUuid: string;
  // number: string|number;
  bandwidth: string|number;
  publicIp: string;
  interfaceName: string;
  netmask: string;
  gateway: string;
  type: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APICreateVpeIpInfoMsg': this
    };
  }

}

export class APIDeleteVpeIpInfoMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIDeleteVpeIpInfoMsg': this
    };
  }
}

/**
 * VPE--接口管理
 */
export class InterfaceInventory {
  uuid: string;
  vpeUuid: string;
  endpointUuid: string;
  endpointName: string;
  switchUuid: string;
  switchName: string;
  switchPortUuid: string;
  switchPortName: string;
  interfaceName: string;
  number: number;
  createDate: string;
}

export class APIVpeInterfaceReply extends APIReply {
  inventories: Array<InterfaceInventory>;
  total: number;
}

export class APIVpeInterfaceEvent extends APIReply {
  inventory: InterfaceInventory;
}

export class APIQueryVpeInterfaceMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIQueryVpeInterfaceMsg': this
    };
  }
}

export class APICreateVpeInterfaceMsg extends APIMessage {
  vpeUuid: string;
  endpointUuid: string;
  switchUuid: string;
  switchPortUuid: string;
  interfaceName: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APICreateVpeInterfaceMsg': this
    };
  }

}

export class APIDeleteVpeInterfaceMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIDeleteVpeInterfaceMsg': this
    };
  }
}


/**
 * CE
* */

export class APIQueryCeMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryCeMsg': this
    };
  }
}

export class APICeReply extends APIReply {
  inventories: Array<CeInventory>;
  total: number;
}

export class APICreateCeMsg extends APIMessage {
  name: string;
  accountUuid: string;
  model: string;
  esn: string;
  country: string;
  province: string;
  city: string;
  address: string;
  bandwidthOfferingUuid: string;
  connectionType: string;
  connectionMode: string;
  sdwanNetworkUuid: string;
  vpnType: string;
  l3Protocol: string;
  applyTemplate: boolean;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APICreateCeMsg': this
    };
  }
}

export class APICeEvent extends APIReply {
  inventory: CeInventory;
}

export class CeInventory {
  uuid: string;
  ceUuid: string;
  name: string;
  number: string;
  accountUuid: string;
  accountName: string;
  company: string;
  model: string;
  esn: string;
  country: string;
  province: string;
  city: string;
  address: string;
  agentVersion: string;
  osVersion: string;
  bandwidthOfferingUuid: string;
  bandwidth: string;
  connectionType: string;
  connectionMode: string;
  sdwanNetworkUuid: string;
  sdwanNetworkName: string;
  sdwanNetworkDistribution: string;
  state: string;
  monitorState: string;
  frpStatus: string;
  vpnType: string;
  popInfos: any;
  lastOpDate: string;
  createDate: string;
  masterEndpointName: string;
  masterLineName: string;
  slaveEndpointName: string;
  slaveLineName: string;
  distribution: string;
  configStatus: string;
  l3Protocol: string;
  description: string;
  vpeUuids: Array<string>;
  // 拓扑属性
  x?: number;
  y?: number;
  color?: string;
  iconClass: string;
  topoType: string;
  ceMasterIp: string;
  sort: number;
  slaveVpeIndex: number;
  applyTemplate?: boolean;
  frpWebPort?: number;
  os: string;
  status: string;
  masterVpeName: string;
  slaveVpeName: string;
}

export class APIBandwidthReply extends APIReply {
  inventories: Array<any>;
  total: number;
}

export class APIUpdateCeMsg extends APIMessage {
  uuid: string;
  name: string;
  address: string;
  description: string;
  country: string;
  province: string;
  city: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIUpdateCeMsg': this
    };
  }
}

export class APIDeleteCeMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIDeleteCeMsg': this
    };
  }
}

export class APIDisableCeMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIDisableCeMsg': this
    };
  }
}

export class APIEnableCeMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIEnableCeMsg': this
    };
  }
}

export class APICreateServiceCidrForCeMsg extends APIMessage {
  cidr: string;
  ceUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APICreateServiceCidrForCeMsg': this
    };
  }
}

export class APIGetCeMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetCeMsg': this
    };
  }
}

export class APIEnableWanPortMsg extends APIMessage {
  uuid: string;
  protocol: string;
  ipCidr: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIEnableWanPortMsg': this
    };
  }
}

export class APIEnableTunnelPortMsg extends APIMessage {
  uuid: string;
  resourceUuid: string;
  endpointUuid: string;
  haType: string;
  remoteIp: string;
  localIp: string;
  netmask: string;
  vlan: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIEnableTunnelPortMsg': this
    };
  }
}

export class APIDisableCePortMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIDisableCePortMsg': this
    };
  }
}

export class APIGetVlanInfoMsg extends APIMessage {
  resourceUuid: string;
  endpointUuid: string;
  connectionType: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetVlanInfoMsg': this
    };
  }
}

export class APIListSdwanEndpointMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APIListSdwanEndpointMsg': this
    };
  }
}

export class APIUpdateLanInfoMsg extends APIMessage {
  uuid: string;
  dhcp: string;
  state: string;
  dns: string;
  localIp: string;
  netmask: string;
  startIp: string;
  endIp: string;
  gateway: string;
  dhcpStatus: string;
  dhcpPeerIp: string;
  dhcpRelayIp: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIUpdateLanInfoMsg': this
    };
  }
}

export class APIUpdateServiceCidrMsg extends APIMessage {
  uuid: string;
  cidr: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIUpdateServiceCidrMsg': this
    };
  }
}

export class APIChangeBandwidthMsg extends APIMessage {
  uuid: string;
  bandwidthOfferingUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIChangeBandwidthMsg': this
    };
  }
}

export class APIQueryCePortModelMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryCePortModelMsg': this
    };
  }
}

export class APIInitCeMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIInitCeMsg': this
    };
  }
}

export class APIGetChangeBandwidthNumMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  ceUuid: string;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetChangeBandwidthNumMsg': this
    };
  }
}

export class APIForceDeleteCeMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIForceDeleteCeMsg': this
    };
  }
}

export class APIChangeVpnTypeMsg extends APIMessage {
  uuid: string;
  vpnType: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIChangeVpnTypeMsg': this
    };
  }
}


export class APIGetCePositionNumMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetCePositionNumMsg': this
    };
  }
}


// 链路监控
export class VPELinkMonitorInventory {
  uuid: string;
  number: number;
  peIp: string;
  peType: string;
  vpeName: string;
  vpeUuid: string;
  vpeIp: string;
  vpnUuid: string;
  sdwanNetworkUuid: string;
  sdwanNetworkName: string;
  status: string;
  monitorIp: string;
  netmask: string;
  alarmStatus: string;
  srcMonitorIp: string;
  destMonitorIp: string;
  alarmCount: number;
  createDate: string;
  lastOpDate: string;
}
export class APIQueryVpnLinkMonitorVOMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIQueryVpnLinkMonitorVOMsg': this
    };
  }
}
export class APIQueryVpnLinkMonitorReply extends APIReply {
  inventories: Array<VPELinkMonitorInventory>;
  total: number;
}

export class APIListVpeForCeMsg extends APIMessage {
  uuid: string;
  vpnType: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIListVpeForCeMsg': this
    };
  }
}

export class APIAssignVpesForCeMsg extends APIMessage {
  ceUuid: string;
  distribution: string;
  vpeUuids: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIAssignVpesForCeMsg': this
    };
  }
}

// 查询已指定过的VPE
export class APICeGetUsedVpesMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APICeGetUsedVpesMsg': this
    };
  }
}

export class APISwitchCeMasterMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APISwitchCeMasterMsg': this
    };
  }
}

export class APIChangeCeSlaveMsg extends APIMessage {
  ceUuid: string;
  popUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIChangeCeSlaveMsg': this
    };
  }
}

export class APIUpdatePopInfoMsg extends APIMessage {
  uuid: string;
  portUuid: string;
  resourceUuid: string;
  endpointUuid: string;
  vlan: string;
  remoteIp: string;
  netmask: string;
  localIp: string;
  switchPortUuid: string;
  peerIp: string;
  asn: string;
  password: string;
  tunnelType: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIUpdatePopInfoMsg': this
    };
  }
}
/**
 * VPE--pe接口管理
 */
export class VpePeInterfaceInventory {
  uuid: string;
  vpeUuid: string;
  vpeName: string;
  peIp: string;
  sdwanNetworkUuid: string;
  sdwanNetworkName: string;
  interfaceName: string;
  vlan: string;
  endpointUuid: string;
  resourceUuid: string;
  vpnCount: string;
  createDate: string;
  lastOpDate: string;
}

export class APIVpePeInterfaceReply extends APIReply {
  inventories: Array<VpePeInterfaceInventory>;
  total: number;
}

export class APIVpePeInterfaceEvent extends APIReply {
  inventory: VpePeInterfaceInventory;
}

export class APIQueryL3VpeInterfaceMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIQueryL3VpeInterfaceMsg': this
    };
  }
}

export class APIDeleteL3VpeInterfaceMsg extends APIMessage {
  uuid: string;
  resourceUuid: string;
  endpointUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.vpe.APIDeleteL3VpeInterfaceMsg': this
    };
  }
}

// -------------------------------CPE 库存管理
export class StockInventory {
  uuid: string;
  ceUuid: string;
  name: string;
  number: string;
  accountUuid: string;
  accountName: string;
  company: string;
  model: string;
  esn: string;
  country: string;
  province: string;
  city: string;
  address: string;
  agentVersion: string;
  osVersion: string;
  bandwidthOfferingUuid: string;
  bandwidth: string;
  connectionType: string;
  connectionMode: string;
  sdwanNetworkUuid: string;
  sdwanNetworkName: string;
  sdwanNetworkDistribution: string;
  state: string;
  monitorState: string;
  status: string;
  frpStatus: string;
  frpServerPort: string;
  vpnType: string;
  popInfos: any;
  lastOpDate: string;
  createDate: string;
  masterEndpointName: string;
  slaveEndpointName: string;
  distribution: string;
  configStatus: string;
  masterSlaveSwitch: string;
  heartBeat: string;
  l3Protocol: string;
  vpeUuids: Array<string>;
  applyTemplate: boolean;
  os: string;
}

export class APIQueryCeInDeletedMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryCeInDeletedMsg': this
    };
  }
}

export class APIAddCeMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  model: string;
  esn: string;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIAddCeMsg': this
    };
  }
}

export class APIAttachAccountToCeMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  uuid: string;
  accountUuid: string;
  name: string;
  country: string;
  province: string;
  city: string;
  address: string;
  bandwidthOfferingUuid: string;
  connectionType: string;
  vpnType: string;
  connectionMode: string;
  sdwanNetworkUuid: string;
  l3Protocol: string;
  applyTemplate: boolean;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIAttachAccountToCeMsg': this
    };
  }
}

export class APIDetachAccountToCeMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIDetachAccountToCeMsg': this
    };
  }
}


export class APIListSupportedEndpointMsg extends APIMessage {
  session: SessionInventory;
  resourceUuid: string;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIListSupportedEndpointMsg': this
    };
  }
}
// ha

export class APIListSuppoetedEndpointReply extends APIReply {
  inventories: Array<any>;
}
export class APIDeleteHaGroupMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ha.APIDeleteHaGroupMsg': this
    };
  }
}

export class APICreateServiceCidrForHaGroupMsg extends APIMessage {
  uuid: string;
  cidr: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ha.APICreateServiceCidrForHaGroupMsg': this
    };
  }
}

export class APIUpdateServiceCidrForHaGroupMsg extends APIMessage {
  uuid: string;
  cidr: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ha.APIUpdateServiceCidrForHaGroupMsg': this
    };
  }
}

export class APIHaReply extends APIReply {
  inventories: Array<HaInventory>;
  total: number;
}



export class HaInventory {
  uuid: string;
  ceUuid: string;
  name: string;
  accountUuid: string;
  accountName: string;
  company: string;
  vip: string;
  vrid: string;
  cidr: string;
  sdwanNetworkUuid: string;
  cePortUuid: string;
  priority: string;
  sdwanNetworkName: string;
  ceInfo: Array<object>;
  ces: Array<object>;
  haGroupCeRefs: any;
}

export class APICreateHaGroupMsg extends APIMessage {
  accountUuid: string;
  name: string;
  vip: string;
  vrid: string;
  sdwanNetworkUuid: string;
  ces: Array<object>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ha.APICreateHaGroupMsg': this
    };
  }
}

export class APIQueryHaGroupMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ha.APIQueryHaGroupMsg': this
    };
  }
}

export class APIUpdateHaGroupMsg extends APIMessage {
  uuid: string;
  name: string;
  vip: string;
  vrid: string;
  sdwanNetworkUuid: string;
  ces: Array<object>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ha.APIUpdateHaGroupMsg': this
    };
  }
}

export class APIHaEvent extends APIReply {
  inventory: HaInventory;
}


export class APIGetHaGroupMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ha.APIGetHaGroupMsg': this
    };
  }
}

export class APICommonQueryReply extends APIReply {
  inventories: Array<any>;
  total: number;
}

export class APICeChangeConnectionMsg extends APIMessage {
  uuid: string;
  bandwidthOfferingUuid: string;
  sdwanNetworkUuid: string;
  l3Protocol: string;
  connectionMode: number;
  connectionType: number;
  masterSlaveSwitch: number;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APICeChangeConnectionMsg': this
    };
  }
}

export class APIListConnectionModelMsg extends APIMessage {
  model: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APIListConnectionModelMsg': this
    };
  }
}

export class APIListConnectionModelReply extends APIReply {
  connectionModes: Array<ConnectionMode>;
}

export class APIInitCeInDeletedMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIInitCeInDeletedMsg': this
    };
  }
}

export class APIInitCeInDeletedReply extends APIReply {
  inventory: any;
}

// 查询vpnType的port
export class APIQuerySdwanVpnPortMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APIQuerySdwanVpnPortMsg': this
    };
  }
}

export class APIQueryCeRouteMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryCeRouteMsg': this
    };
  }
}

export class APIBatchCreateCeRouteMsg extends APIMessage {
  ceUuid: string;
  nexthop: string;
  destinations: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIBatchCreateCeRouteMsg': this
    };
  }
}

export class APIBatchDeleteCeRouteMsg extends APIMessage {
  ceUuid: string;
  uuids: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIBatchDeleteCeRouteMsg': this
    };
  }
}

export class CpeMonitorTaskInventory  {
  uuid: string;
  ceUuid: string;
  dev: string;
  targetIp: string;
  lastOpDate: string;
  createDate: string;
}

export class APIQueryCpeMonitorTaskMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryCpeMonitorTaskMsg': this
    };
  }
}

export class APIGetCePortMsg extends APIMessage {
  ceUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetCePortMsg': this
    };
  }
}

export class APIDeleteCpeMonitorTaskMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIDeleteCpeMonitorTaskMsg': this
    };
  }
}

export class APICreateCpeMonitorTaskMsg extends APIMessage {
  ceUuid: string;
  dev: string;
  targetIp: string;
  type: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APICreateCpeMonitorTaskMsg': this
    };
  }
}

export class APICreateCpePingMsg extends APIMessage {
  ceUuid: string;
  dev: string;
  targetIp: string;
  type: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APICreateCpePingMsg': this
    };
  }
}

export class APIGetCpePingResultMsg extends APIMessage {
  ceUuid: string;
  taskUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetCpePingResultMsg': this
    };
  }
}

export class APIGetCpeMonitorTaskResultMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetCpeMonitorTaskResultMsg': this
    };
  }
}
// agent 版本
export class AgentVersionInventory {
  uuid: string;
  version: string;
  description: string;
  url: string;
  os: string;
  createDate: string;
}
export class APICreateAgentVersionMsg extends APIMessage {
  version: string;
  url: string;
  description: string;
  os: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.version.APICreateAgentVersionMsg': this
    };
  }
}
export class APIUpdateAgentVersionMsg extends APIMessage {
  uuid: string;
  version: string;
  url: string;
  description: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.version.APIUpdateAgentVersionMsg': this
    };
  }
}
export class APIDeleteAgentVersionMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.version.APIDeleteAgentVersionMsg': this
    };
  }
}
export class APIQueryAgentVersionMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.version.APIQueryAgentVersionMsg': this
    };
  }
}
export class APIAgentVersionEvent extends APIReply {
  inventory: AgentVersionInventory;
}
export class APIAgentVersionReply extends APIReply {
  inventories: Array<AgentVersionInventory>;
  total: number;
}
export class APIUpgradeCeAgentVersionMsg extends APIMessage {
  uuid: string;
  agentVersion: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIUpgradeCeAgentVersionMsg': this
    };
  }
}
// ce 型号
export class CeModelInventory {
  model: string;
  description: string;
  createDate: string;
}
export class APIQueryCeModelMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APIQueryCeModelMsg': this
    };
  }
}

export class APIQueryCeModelReply extends APIReply {
  inventories: Array<CeModelInventory>;
  total: number;
}
export class CePortModelInventory {
  id: number;
  model: string;
  name: string;
  deviceId: number;
  state: string;
  type: string;
  attribute: string;
  protocol: string;
  mode: string;
  createDate: string;
}

export class APIQueryCePortModelReply extends APIReply {
  inventories: Array<CePortModelInventory>;
  total: number;
}

export class APIQueryNatTargetCidrMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryNatTargetCidrMsg': this
    };
  }
}

export class APIBatchCreateTargetCidrMsg extends APIMessage {
  ceUuid: string;
  targetCidrs: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIBatchCreateTargetCidrMsg': this
    };
  }
}

export class APIBatchDeleteTargetCidrMsg extends APIMessage {
  ceUuid: string;
  targetCidrs: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIBatchDeleteTargetCidrMsg': this
    };
  }
}

export class APIBatchCreateServiceCidrForCeMsg extends APIMessage {
  ceUuid: string;
  cidr: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIBatchCreateServiceCidrForCeMsg': this
    };
  }
}

export class APIBatchDeleteServiceCidrForCeMsg extends APIMessage {
  ceUuid: string;
  uuids: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIBatchDeleteServiceCidrForCeMsg': this
    };
  }
}

export class FirewallInventory  {
  uuid: string;
  srcIP: string;
  destIP: string;
  protocol: string;
  srcPort: number;
  destPort: number;
  direction: string;
  action: string;
  lastOpDate: string;
  createDate: string;
  ceUuid: string;
  sdwanNetworkUuid: string;
  rank: number;
}
export class APIQueryFirewallMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryFirewallMsg': this
    };
  }
}
export class APIAddListFirewallMsg extends APIMessage {
  ceUuid: string;
  firewalls: Array<FirewallInventory>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIAddListFirewallMsg': this
    };
  }
}
export class APIAddListFirewallEvent extends APIReply {
  inventories: Array<FirewallInventory>;
}


// 报警管理
export class AlarmHistoryInventory {
  uuid: string;
  accountUuid: string;
  productUuid: string;
  monitorUuid: string;
  productType: string;
  alarmTime: string;
  duration: string;
  alarmContent: string;
  resumeTime: string;
  status: string;
  translateHostType: string;
  productName: string;
}
export class APIQueryAlarmLogReply {
  inventories: Array<AlarmHistoryInventory>;
  total: number;
  success: boolean;
  error: ErrorCode;
}
export class APIQueryAlarmLogMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Alarm;

  toApiMap(): any {
    return {
      'com.syscxp.alarm.header.log.APIQueryAlarmLogMsg': this
    };
  }
}

export class APIBatchDeleteServiceCidrForHaGroupMsg extends APIMessage {
  haGroupUuid: string;
  uuids: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ha.APIBatchDeleteServiceCidrForHaGroupMsg': this
    };
  }
}

export class APIBatchCreateServiceCidrForHaGroupMsg extends APIMessage {
  haGroupUuid: string;
  cidr: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ha.APIBatchCreateServiceCidrForHaGroupMsg': this
    };
  }
}

export class APIGetCeFaultMsg extends APIMessage {
  limit: number;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetCeFaultMsg': this
    };
  }
}

export class VpePopInfoInventory {
  uuid: string;
  ceUuid: string;
  nicName: string;
  status: string;
  haType: string;
  bandwidth: number;
  bandwidthString: string;
  bandwidthUsage: number;
  rtt: number;
  loss: number;
}
export class APIQueryPopInfoMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryPopInfoMsg': this
    };
  }
}
export class APIQueryPopInfoReply extends APIReply {
  inventories: Array<VpePopInfoInventory>;
}

export class QosInventory  {
  uuid: string;
  srcIp: string;
  destIp: string;
  protocol: string;
  srcPort: number;
  destPort: number;
  type: string;
  level: string;
  lastOpDate: string;
  createDate: string;
  ceUuid: string;
  sdwanNetworkUuid: string;
  rank: number;
}

export class APIQueryQosRuleMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryQosRuleMsg': this
    };
  }
}

export class APICreateQosRuleMsg extends APIMessage {
  ceUuid: string;
  srcIp: string;
  destIp: string;
  srcPort: number;
  destPort: number;
  protocol: string;
  type: string;
  level: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APICreateQosRuleMsg': this
    };
  }
}

export class APIDeleteQosRuleMsg extends APIMessage {
  ceUuid: string;
  uuids: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIDeleteQosRuleMsg': this
    };
  }
}

export class APIGetQosTypeMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  uuid: string;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetQosTypeMsg': this
    };
  }
}

export class APIUpdateQosTypeMsg extends APIMessage {
  ceUuid: string;
  type: string;
  bandwidth: number;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIUpdateQosTypeMsg': this
    };
  }
}

export class APIGetCeBandwidthStatisticsMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetCeBandwidthStatisticsMsg': this
    };
  }
}

export class APIGetPublicNetworkBandwidthStatisticsMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APIGetPublicNetworkBandwidthStatisticsMsg': this
    };
  }
}
export class RyuMonitorInventory {
  uuid: string;
  url: string;
  status: string;
  heartDate: string;
  createDate: string;
  lastOpDate: string;
}
export class APIQueryRyuMonitorMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.monitor.APIQueryRyuMonitorMsg': this
    };
  }
}
export class APIQueryRyuReply extends APIReply {
  inventories: Array<RyuMonitorInventory>;
  total: number;
}

export class APIGetResourceQuotaMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  uuid: string;
  resourceType: string;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetResourceQuotaMsg': this
    };
  }
}

export class APIUpdateResourceQuotaMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  resourceUuid: string;
  resourceType: string;
  resourceQuotas: Array<any>;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIUpdateResourceQuotaMsg': this
    };
  }
}

export class APIQueryServiceCidrMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryServiceCidrMsg': this
    };
  }
}

export class APIQueryStrategyPathMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryStrategyPathMsg': this
    };
  }
}

export class APIUpdateStrategyPathMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  uuid: string;
  state: string;
  type: string;
  loadBalances: Array<{[propName: string]: any}>;
  apps: Array<{[propName: string]: string}>;
  popAssignWans: Array<{[propName: string]: string}>;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIUpdateStrategyPathMsg': this
    };
  }
}

export class APIAddAppMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  ceUuid: string;
  name: string;
  popUuid: string;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIAddAppMsg': this
    };
  }
}

export class APIBatchDeleteAppMsg extends APIMessage {
  ceUuid: string;
  uuids: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIBatchDeleteAppMsg': this
    };
  }
}

export class APIAddAppDefinitionMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  appUuid: string;
  appModelUuid: string;
  destIp: string;
  destPort: number;
  protocol: string;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIAddAppDefinitionMsg': this
    };
  }
}

export class APIBatchDeleteAppDefinitionMsg extends APIMessage {
  appUuid: string;
  uuids: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIBatchDeleteAppDefinitionMsg': this
    };
  }
}

export class APIQueryAppDefinitionMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryAppDefinitionMsg': this
    };
  }
}

export class APIGetStrategyPathMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  uuid: string;
  type: string;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetStrategyPathMsg': this
    };
  }
}

export class APIRefreshCeWanPortInfoMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  uuid: string;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIRefreshCeWanPortInfoMsg': this
    };
  }
}

export class APIRefreshCeHeartBeatEvent extends APIReply {
  heartBeat: string;
}

export class APIUpdateAppMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  uuid: string;
  name: string;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIUpdateAppMsg': this
    };
  }
}

export class APIQueryFirewallModelMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APIQueryFirewallModelMsg': this
    };
  }
}

export class APIQueryQosModelMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APIQueryQosModelMsg': this
    };
  }
}

export class APIGetResourceModelQuotaMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APIGetResourceModelQuotaMsg': this
    };
  }
}

export class APICreateFirewallModelMsg extends APIMessage {
  sdwanNetworkUuid: string;
  firewalls: Array<FirewallInventory>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APICreateFirewallModelMsg': this
    };
  }
}

export class APICreateQosModelMsg extends APIMessage {
  sdwanNetworkUuid: string;
  srcIp: string;
  destIp: string;
  srcPort: number;
  destPort: number;
  protocol: string;
  type: string;
  level: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APICreateQosModelMsg': this
    };
  }
}

export class APIDeleteQosModelMsg extends APIMessage {
  sdwanNetworkUuid: string;
  uuids: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APIDeleteQosModelMsg': this
    };
  }
}

export class APIQueryAppModelMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APIQueryAppModelMsg': this
    };
  }
}

export class APICreateAppModelMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  sdwanNetworkUuid: string;
  name: string;
  haType: string;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APICreateAppModelMsg': this
    };
  }
}

export class APIDeleteAppModelMsg extends APIMessage {
  sdwanNetworkUuid: string;
  uuids: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APIDeleteAppModelMsg': this
    };
  }
}

export class APIListDhcpLeaseMsg extends APIMessage {
  session: SessionInventory;
  uuid: string;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIListDhcpLeaseMsg': this
    };
  }
}

export class APIListDhcpLeaseReply extends APICommonQueryReply {

}

export class LeaseInventory  {
   expires: string;
   hostname: string;
   ip: string;
   pool: string;
   hardware_address: string;
}

export class APIRestartCeMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIRestartCeMsg': this
    };
  }
}

export class APIRestartCeAgentMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIRestartCeAgentMsg': this
    };
  }
}

export class APIRestartCeEvent extends APIReply {
  inventory: CeInventory;
}

export class APIRestartCeAgentEvent extends APIReply {
  inventory: CeInventory;
}

export class APIQueryAppModelDefinitionMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APIQueryAppModelDefinitionMsg': this
    };
  }
}

export class APIAddAppModelDefinitionMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  appModelUuid: string;
  destIp: string;
  destPort: number;
  protocol: string;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APIAddAppModelDefinitionMsg': this
    };
  }
}

export class APIBatchDeleteAppModelDefinitionMsg extends APIMessage {
  appModelUuid: string;
  uuids: Array<string>;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APIBatchDeleteAppModelDefinitionMsg': this
    };
  }
}

export class APIDisableCePortNatMsg extends APIMessage {
  cePortUuid: string;
  ceUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIDisableCePortNatMsg': this
    };
  }
}

export class APIEnableCePortNatMsg extends APIMessage {
  cePortUuid: string;
  ceUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIEnableCePortNatMsg': this
    };
  }
}

export class APIUpdateAppModelMsg extends APIMessage {
  appModelUuid: string;
  name: string;
  haType: string;

  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.model.APIUpdateAppModelMsg': this
    };
  }
}

export class APISwitchCeSdwanNetworkMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  ceUuid: string;
  sdwanNetworkUuid: string;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APISwitchCeSdwanNetworkMsg': this
    };
  }
}

export class APIResetCeSecretKeyMsg extends APIMessage {
  ceUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIResetCeSecretKeyMsg': this
    };
  }
}

export class BfdInventory {
  uuid: string;
  recInterval: number;
  transInterval: number;
  bfdState: string;
}

export class APIUpdateBfdMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  uuid: string;
  recInterval: number;
  transInterval: number;
  bfdState: string;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIUpdateBfdMsg': this
    };
  }
}

export class APIGetBfdMsg extends APIMessage {
  session: SessionInventory;
  uuid: string;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetBfdMsg': this
    };
  }
}

export class APIQueryOspfMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryOspfMsg': this
    };
  }
}

export class APIListOspfPortMsg extends APIMessage {
  session: SessionInventory;
  uuid: string;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIListOspfPortMsg': this
    };
  }
}

export class APIEnableOspfMsg extends APIMessage {
  ceUuid: string;
  area: string;
  metrics: string;
  helloInterval: string;
  deadInterval: string;
  interfaceName: string;

  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIEnableOspfMsg': this
    };
  }
}

export class APIDisableOspfMsg extends APIMessage {
  uuid: string;
  ceUuid: string;

  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIDisableOspfMsg': this
    };
  }
}

export class APIQueryCeQosOptimizeMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryCeQosOptimizeMsg': this
    };
  }
}

export class APIEnableQosWanBandwidthEnsureMsg extends APIMessage {
  ceUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIEnableQosWanBandwidthEnsureMsg': this
    };
  }
}

export class APIDisableQosWanBandwidthEnsureMsg extends APIMessage {
  ceUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIDisableQosWanBandwidthEnsureMsg': this
    };
  }
}

export class APIEnableQosPopLossMsg extends APIMessage {
  ceUuid: string;
  lossRate: number;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIEnableQosPopLossMsg': this
    };
  }
}

export class APIDisableQosPopLossMsg extends APIMessage {
  ceUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIDisableQosPopLossMsg': this
    };
  }
}

export class APIGetCeTunnelManageMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIGetCeTunnelManageMsg': this
    };
  }
}

export class APIGetSdwanTunnelManageMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APIGetSdwanTunnelManageMsg': this
    };
  }
}

export class APIUpdateCeTunnelManageMsg extends APIMessage {
  uuid: string;
  state: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIUpdateCeTunnelManageMsg': this
    };
  }
}

export class APIUpdateSdwanTunnelManageMsg extends APIMessage {
  uuid: string;
  state: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.network.APIUpdateSdwanTunnelManageMsg': this
    };
  }
}

export class APIGetWechatQRMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Account;

  toApiMap(): any {
    return {
      'com.syscxp.account.header.account.APIGetWechatQRMsg': this
    };
  }
}

export class APICheckWechatQRScanMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Account;
  ticket: string;

  toApiMap(): any {
    return {
      'com.syscxp.account.header.account.APICheckWechatQRScanMsg': this
    };
  }
}

export class APIGetAccountMFADetailMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Account;

  toApiMap(): any {
    return {
      'com.syscxp.account.header.account.APIGetAccountMFADetailMsg': this
    };
  }
}

export class APIGetVerificationCodeMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Account;
  phone: string;

  toApiMap(): any {
    return {
      'com.syscxp.sms.header.APIGetVerificationCodeMsg': this
    };
  }
}

export class APIValidateMFAFrontMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Account;
  mfaType: string;
  mfaCode: string;

  toApiMap(): any {
    return {
      'com.syscxp.account.header.account.APIValidateMFAFrontMsg': this
    };
  }
}

export class APISetDefaultMfaTypeMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Account;
  defaultMfaType: string;

  toApiMap(): any {
    return {
      'com.syscxp.account.header.account.APISetDefaultMfaTypeMsg': this
    };
  }
}

export class APIQueryCePortMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryCePortMsg': this
    };
  }
}

export class APIQueryLanInfoMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIQueryLanInfoMsg': this
    };
  }
}

export class LanInfoInventory {
  uuid: string;
  type: string;
  dhcp: boolean;
  dns: string;
  localIp: string;
  netmask: string;
  state: string;
  startIp: string;
  endIp: string;
  gateway: string;
  dhcpStatus: string;
  dhcpPeerIp: string;
  lastOpDate: string;
  createDate: string;
  dhcpRelayIp: string;
}

export class APILanInfoReply extends APIReply {
  inventories: Array<LanInfoInventory>;
  total: number;
}

export class CePortInventory {
  uuid: string;
  ceUuid: string;
  name: boolean;
  deviceId: any;
  state: string;
  type: string;
  attribute: string;
  protocol: string;
  ipCidr: string;
  netmask: string;
  gateway: string;
  lastOpDate: string;
  createDate: string;
  natState: any;
}

export class APICePortReply extends APIReply {
  inventories: Array<CePortInventory>;
  total: number;
}

export class APIChangePopToTunnelMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIChangePopToTunnelMsg': this
    };
  }
}

export class APIChangePopToTunnelEvent extends APIReply {
  inventory: {[props: string]: string};
}

export class APISyncPortInfoFromClientMsg extends APIMessage {
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  uuid: string;
  portNames: Array<string>;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APISyncPortInfoFromClientMsg': this
    };
  }
}

export class APISyncHaInfoFromClientMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;

  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APISyncHaInfoFromClientMsg': this
    };
  }
}

export class APIResetClientPasswordMsg extends APIMessage {
  uuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Sdwan;
  toApiMap(): any {
    return {
      'com.syscxp.header.sdwan.ce.APIResetClientPasswordMsg': this
    };
  }
}
