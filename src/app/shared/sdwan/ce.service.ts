import {Injectable} from '@angular/core';
import {RestApiService} from '../rest-api.service';
import {APIQueryMsg, APIReply, QueryObject} from '../../base';
import * as CE from './api';
import {AccountService} from '../account';
import {MsgService} from '../message/msg.service';
import {
  APICeEvent,
  APICeReply, APICommonQueryReply, APICreateCpeMonitorTaskMsg,
  APIDetachAccountToCeMsg,
  APIDisableCeMsg, APIDisableOspfMsg,
  APIEnableCeMsg, APIEnableOspfMsg,
  APIForceDeleteCeMsg, APIListVpeForCeMsg,
  APIUpdateCeMsg, CeInventory, QosInventory
} from './api';
import {SdwanService} from './sdwan.service';
import {APIEnableWanPortMsg} from './api';
import {APIEnableTunnelPortMsg} from './api';
import {APIDisableCePortMsg} from './api';
import {APIUpdateLanInfoMsg} from './api';
import {APIChangeBandwidthMsg} from './api';
import {APIInitCeMsg} from './api';
import {APIChangeVpnTypeMsg} from './api';
import {APISdwanNetworkEvent} from './api';
import {APIAssignVpesForCeMsg} from './api';
import {APICeGetUsedVpesMsg} from './api';
import {APISwitchCeMasterMsg} from './api';
import {APIChangeCeSlaveMsg} from './api';
import {APICeChangeConnectionMsg} from './api';
import {APIBatchCreateCeRouteMsg} from './api';
import {APIBatchDeleteCeRouteMsg} from './api';
import {APIDeleteCpeMonitorTaskMsg} from './api';
import {APICreateCpePingMsg} from './api';
import {APIUpgradeCeAgentVersionMsg} from './api';
import {APIBatchCreateTargetCidrMsg} from './api';
import {APIBatchDeleteTargetCidrMsg} from './api';
import {APIBatchCreateServiceCidrForCeMsg} from './api';
import {APIBatchDeleteServiceCidrForCeMsg} from './api';
import {APIAddListFirewallEvent} from './api';
import {APIEnableCePortNatMsg} from './api';
import {APIDisableCePortNatMsg} from './api';
import {APIResetCeSecretKeyMsg} from './api';
import {APIUpdateCeTunnelManageMsg} from './api';
import {APIUpdateSdwanTunnelManageMsg} from './api';
import {APIGetCeTunnelManageMsg} from './api';
import {APIChangePopToTunnelMsg} from './api';
import {APIChangePopToTunnelEvent} from './api';
import {APISyncPortInfoFromClientMsg} from './api';
import {APIResetClientPasswordMsg} from './api';

@Injectable()
export class CeService {

  constructor(private api: RestApiService,
              private actMgr: AccountService,
              private msgService: MsgService,
              private networkService: SdwanService) {
  }

  query(qobj: QueryObject, callback: (lists: CE.CeInventory[], total: number) => void, OnlyCount = false, queryAccount = true) {
    const msg = new CE.APIQueryCeMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: CE.APICeReply) => {
      if (OnlyCount) {
        callback([], rst.total);
      } else {
        const ces = rst.inventories;
        if (rst.success && ces && ces.length) {
          const accountUuids = [], sdwanNetworkUuids = [];
          ces.forEach((value) => {
            if (accountUuids.indexOf(value.accountUuid) === -1) {
              accountUuids.push(value.accountUuid);
            }
            if (sdwanNetworkUuids.indexOf(value.sdwanNetworkUuid) === -1) {
              sdwanNetworkUuids.push(value.sdwanNetworkUuid);
            }
          });
          if (queryAccount) {
            const qobj1 = new QueryObject();
            qobj1.fields = ['name', 'company', 'uuid'];
            qobj1.addCondition({name: 'uuid', op: 'in', value: accountUuids.join(',')});
            this.actMgr.query(qobj1, (accounts) => {
              ces.forEach((c) => {
                accounts.forEach((a) => {
                  if (a.uuid === c.accountUuid) {
                    c.accountName = a.name;
                    c.company = a.company;
                  }
                });
              });

              const qobj2 = new QueryObject();
              qobj2.fields = ['name', 'uuid', 'distribution'];
              qobj2.addCondition({name: 'uuid', op: 'in', value: sdwanNetworkUuids.join(',')});
              this.networkService.query(qobj2, (networks) => {
                ces.forEach((c) => {
                  networks.forEach((n) => {
                    if (n.uuid === c.sdwanNetworkUuid) {
                      c.sdwanNetworkName = n.name;
                      c.sdwanNetworkDistribution = n.distribution;
                    }
                  });
                });
                callback(ces, rst.total);
              }, false);
            });
          }else {
            callback(ces, rst.total);
          }
        } else {
          callback([], 0);
        }
      }
    });
  }

  // 查询所有带宽
  queryBandwidth(qobj: any, callback: (bandwidths: any, total: number) => void) {
    const msg = new CE.APIQueryBandwidthOfferingMsg();
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions;
    return this.api.call(msg).subscribe((datas: CE.APIBandwidthReply) => {
      if (datas.success && datas && datas.total) {
        callback(datas.inventories, datas.total);
      } else {
        callback([], 0);
      }
    });
  }

  queryPopInfo(qobj: any, callback: (datas: any, total: number) => void, queryCpe = false) {
    const msg = new CE.APIQueryPopInfoMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((datas: any) => {
      if (datas.success && datas && datas.total) {
        const inventories = datas.inventories;
        if (queryCpe) {
          const cpeUuids = [];
          inventories.forEach((value) => {
            if (cpeUuids.indexOf(value.ceUuid) === -1) {
              cpeUuids.push(value.ceUuid);
            }
          });

          const qobj_cpe = new QueryObject();
          qobj_cpe.fields = ['name', 'uuid'];
          qobj_cpe.addCondition({name: 'uuid', op: 'in', value: cpeUuids.join(',')});
          this.query(qobj_cpe, (cpes) => {
            inventories.forEach((value) => {
              cpes.forEach((v) => {
                if (v.uuid === value.ceUuid) {
                  value.ceName = v.name;
                }
              });
            });
            callback(inventories, datas.total);
          });
        } else {
          callback(inventories, datas.total);
        }
      } else {
        callback([], 0);
      }
    });
  }

  create(ceRef: CE.CeInventory, done: (node) => void, error: () => void = null) {
    const msg = new CE.APICreateCeMsg();
    msg.name = ceRef.name;
    msg.accountUuid = ceRef.accountUuid;
    msg.model = ceRef.model;
    msg.esn = ceRef.esn;
    msg.connectionType = ceRef.connectionType;
    msg.connectionMode = ceRef.connectionMode;
    if (ceRef.sdwanNetworkUuid) {
      msg.sdwanNetworkUuid = ceRef.sdwanNetworkUuid;
    }
    if (ceRef.applyTemplate) {msg.applyTemplate = ceRef.applyTemplate; }
    msg.country = ceRef.country;
    msg.province = ceRef.province;
    msg.city = ceRef.city;
    msg.address = ceRef.address;
    if (ceRef.l3Protocol) {
      msg.l3Protocol = ceRef.l3Protocol;
    }
    if (ceRef.bandwidthOfferingUuid) {
      msg.bandwidthOfferingUuid = ceRef.bandwidthOfferingUuid;
    }
    if (ceRef.vpnType) {
      msg.vpnType = ceRef.vpnType;
    }
    return this.api.call(msg).subscribe((rst: CE.APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `创建CPE${rst.inventory.name}成功`});
        rst.inventory.accountName = ceRef.accountName;
        rst.inventory.company = ceRef.company;
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `创建CPE${msg.name}失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }


  update(ceRef: CE.CeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIUpdateCeMsg();
    msg.uuid = ceRef.uuid;
    msg.name = ceRef.name;
    msg.address = ceRef.address;
    msg.description = ceRef.description;
    msg.country = ceRef.country;
    msg.province = ceRef.province;
    msg.city = ceRef.city;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `修改CPE${rst.inventory.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `修改CPE${ceRef.name}失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  delete(ceRef: CE.CeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIDetachAccountToCeMsg();
    msg.uuid = ceRef.uuid;
    return this.api.call(msg).subscribe((rst: APICeReply) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除CPE${ceRef.name}成功`});
        done(ceRef);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除CPE${ceRef.name}失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  fDelete(ceRef: CE.CeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIForceDeleteCeMsg();
    msg.uuid = ceRef.uuid;
    return this.api.call(msg).subscribe((rst: APICeReply) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `强制删除CPE${ceRef.name}成功`});
        done(ceRef);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `强制删除CPE${ceRef.name}失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  init(ceRef: CE.CeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIInitCeMsg();
    msg.uuid = ceRef.uuid;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `初始化CPE${ceRef.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `初始化CPE${ceRef.name}失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  disable(ceRef: CE.CeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIDisableCeMsg();
    msg.uuid = ceRef.uuid;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `禁用CPE${ceRef.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `禁用CPE${ceRef.name}失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  enable(ceRef: CE.CeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIEnableCeMsg();
    msg.uuid = ceRef.uuid;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `启用CPE${ceRef.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `启用CPE${ceRef.name}失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // 查询详情接口信息
  getDetail(uuid: string, callback: (datas: any) => void) {
    const msg = new CE.APIGetCeMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((datas: APIReply) => {
      if (datas.success) {
        callback(datas);
      } else {
        callback([]);
      }
    });
  }

  enableWanPort(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIEnableWanPortMsg();
    msg.uuid = infoPage.uuid;
    msg.protocol = infoPage.protocol;
    if (infoPage.ipCidr) {
      msg.ipCidr = infoPage.ipCidr;
    }
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `启用端口成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `启用端口失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  enableTunnelPort(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIEnableTunnelPortMsg();
    msg.uuid = infoPage.uuid;
    msg.resourceUuid = infoPage.resourceUuid;
    msg.endpointUuid = infoPage.endpointUuid;
    if (infoPage.haType) {
      msg.haType = infoPage.haType;
    }
    if (infoPage.remoteIp) {
      msg.remoteIp = infoPage.remoteIp;
    }
    if (infoPage.localIp) {
      msg.localIp = infoPage.localIp;
    }
    if (infoPage.vlan) {
      msg.vlan = infoPage.vlan;
    }
    if (infoPage.netmask) {
      msg.netmask = infoPage.netmask;
    }
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `启用端口成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `启用端口失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  disablePort(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIDisableCePortMsg();
    msg.uuid = infoPage.uuid;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `禁用端口成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `禁用端口失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // 获取专线 vlan
  getVlanInfo(infoPage: any, callback: (datas: any) => void) {
    const msg = new CE.APIGetVlanInfoMsg();
    msg.resourceUuid = infoPage.resourceUuid;
    msg.endpointUuid = infoPage.endpointUuid;
    msg.connectionType = infoPage.connectionType;
    return this.api.call(msg).subscribe((datas: CE.APICeReply) => {
      if (datas.success && datas) {
        callback(datas);
      } else {
        callback([]);
      }
    });
  }

  /*sdwan获取连接点*/
  listSdwanEndpoint(infoPage: any, callback: (bandwidths: any) => void) {
    const msg = new CE.APIListSdwanEndpointMsg();
    msg.uuid = infoPage.uuid;
    return this.api.call(msg).subscribe((datas: CE.APICeReply) => {
      if (datas.success && datas.inventories.length !== 0) {
        callback(datas.inventories);
      } else {
        callback([]);
      }
    });
  }

  /*修改ce-LAN信息*/
  updateLan(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIUpdateLanInfoMsg();
    msg.uuid = infoPage.uuid;
    msg.dhcp = infoPage.dhcp;
    msg.state = infoPage.state;
    if (infoPage.dns) {
      msg.dns = infoPage.dns;
    }
    if (infoPage.localIp) {
      msg.localIp = infoPage.localIp;
    }
    if (infoPage.netmask) {
      msg.netmask = infoPage.netmask;
    }
    if (infoPage.startIp) {
      msg.startIp = infoPage.startIp;
    }
    if (infoPage.endIp) {
      msg.endIp = infoPage.endIp;
    }
    if (infoPage.gateway) {
      msg.gateway = infoPage.gateway;
    }
    if (infoPage.dhcpStatus) {
      msg.dhcpStatus = infoPage.dhcpStatus;
    }
    if (infoPage.dhcpPeerIp) {
      msg.dhcpPeerIp = infoPage.dhcpPeerIp;
    }
    if (infoPage.dhcpRelayIp) {
      msg.dhcpRelayIp = infoPage.dhcpRelayIp;
    }
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `修改LAN配置成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `修改LAN配置失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*修改带宽*/
  updateBandwidth(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIChangeBandwidthMsg();
    msg.uuid = infoPage.uuid;
    msg.bandwidthOfferingUuid = infoPage.bandwidthOfferingUuid;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `变更带宽成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `变更带宽失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // 查询所有CE型号
  queryModels(qobj: QueryObject, callback: (bandwidths: any, total: number) => void) {
    const msg = new CE.APIQueryCePortModelMsg();
    msg.groupBy = qobj.groupBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions;
    msg.fields = qobj.fields;
    return this.api.call(msg).subscribe((datas: CE.APIQueryCePortModelReply) => {
      if (datas.success && datas && datas.total) {
        callback(datas.inventories, datas.total);
      } else {
        callback([], 0);
      }
    });
  }

  // 调整带宽次数查询
  getModifyNum(uuid: string, callback: (ret: any) => void) {
    const msg = new CE.APIGetChangeBandwidthNumMsg();
    msg.ceUuid = uuid;
    return this.api.call(msg).subscribe((datas: any) => {
      if (datas.success) {
        callback(datas);
      }
    });
  }

  /*修改vpn模式*/
  updateVpnType(ceRef: CE.CeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIChangeVpnTypeMsg();
    msg.uuid = ceRef.uuid;
    msg.vpnType = ceRef.vpnType;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `修改CPE${rst.inventory.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `修改CPE${ceRef.name}失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*指定cpe*/
  getListVpeForCpe(refer: CeInventory, callback: (lists: any) => void) {
    const msg = new APIListVpeForCeMsg();
    msg.uuid = refer.uuid;
    return this.api.call(msg).subscribe((rst: any) => {
      const lists = rst.inventories;
      if (rst.success && lists && lists.length) {
        callback(lists);
      } else {
        callback([]);
      }
    });
  }

  assignVpe(refer: CeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIAssignVpesForCeMsg();
    msg.ceUuid = refer.ceUuid;
    msg.distribution = refer.distribution;
    msg.vpeUuids = refer.vpeUuids;
    return this.api.call(msg).subscribe((rst: APISdwanNetworkEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `指定VPE成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `指定VPE失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // 查询已指定过的VPE
  getUsedVpes(uuid: string, callback: (datas: any) => void) {
    const msg = new APICeGetUsedVpesMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        callback(rst.inventories);
      } else {
        callback([]);
      }
    });
  }

  /*主备切换*/
  switchMaster(ceRef: CE.CeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APISwitchCeMasterMsg();
    msg.uuid = ceRef.uuid;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `切换主备链路${ceRef.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `切换主备链路${ceRef.name}失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*变更备链路*/
  changeSlave(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIChangeCeSlaveMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.popUuid = infoPage.popUuid;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `变更备链路成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `变更备链路失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*链路配置*/
  updateCeLine(infoPage: any, done: (data) => void, error: () => void = null) {
    const msg = new CE.APIUpdatePopInfoMsg();
    msg.uuid = infoPage.uuid;
    if (infoPage.resourceUuid) {
      msg.resourceUuid = infoPage.resourceUuid;
    }
    if (infoPage.endpointUuid) {
      msg.endpointUuid = infoPage.endpointUuid;
    }
    if (infoPage.vlan) {
      msg.vlan = infoPage.vlan;
    }
    if (infoPage.remoteIp) {
      msg.remoteIp = infoPage.remoteIp;
    }
    msg.netmask = infoPage.netmask;
    if (infoPage.peerIp) {
      msg.peerIp = infoPage.peerIp;
    }
    msg.localIp = infoPage.localIp;
    if (infoPage.portUuid) {
      msg.portUuid = infoPage.portUuid;
    }
    if (infoPage.switchPortUuid) {
      msg.switchPortUuid = infoPage.switchPortUuid;
    }
    if (infoPage.tunnelType) {
      msg.tunnelType = infoPage.tunnelType;
    }
    if (infoPage.asn) {
      msg.asn = infoPage.asn;
    }
    if (infoPage.password) {
      msg.password = infoPage.password;
    }
    return this.api.call(msg).subscribe((rst: CE.APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `链路配置成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `链路配置失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // 查询专线连接点
  getTunnelEndpoints(resourceUuid: string, callback: (datas: any) => void) {
    const msg = new CE.APIListSupportedEndpointMsg();
    msg.resourceUuid = resourceUuid;
    return this.api.call(msg).subscribe((rst: CE.APIListSuppoetedEndpointReply) => {
      if (rst.success && rst.inventories.length) {
        callback(rst.inventories);
      } else {
        callback([]);
      }
    });
  }

  /*修改链路*/
  updateConnectionMode(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APICeChangeConnectionMsg();
    msg.uuid = infoPage.uuid;
    msg.connectionMode = infoPage.connectionMode;
    msg.connectionType = infoPage.connectionType;
    msg.masterSlaveSwitch = infoPage.masterSlaveSwitch;
    if (infoPage.l3Protocol) {
      msg.l3Protocol = infoPage.l3Protocol;
    }
    if (infoPage.bandwidthOfferingUuid) {
      msg.bandwidthOfferingUuid = infoPage.bandwidthOfferingUuid;
    }
    if (infoPage.sdwanNetworkUuid) {
      msg.sdwanNetworkUuid = infoPage.sdwanNetworkUuid;
    }
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `修改链路成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `修改链路失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // 查询初始模式
  listConnection(model: string, callback: (ret: any) => void) {
    const msg = new CE.APIListConnectionModelMsg();
    msg.model = model;
    return this.api.call(msg).subscribe((datas: CE.APIListConnectionModelReply) => {
      if (datas.success) {
        callback(datas.connectionModes);
      }
    });
  }

  /*查询业务网段*/
  queryServiceCidr(qobj: QueryObject, callback: (lists: any, total: number) => void) {
    const msg = new CE.APIQueryServiceCidrMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: CE.APICommonQueryReply) => {
      if (rst.success) {
        callback(rst.inventories, rst.total);
      }
    });
  }

  /*增加业务网段*/
  createServiceCidr(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIBatchCreateServiceCidrForCeMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.cidr = infoPage.cidr;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `创建业务网段成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `创建业务网段失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*删除业务网段*/
  deleteServiceCidr(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIBatchDeleteServiceCidrForCeMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.uuids = infoPage.uuids;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除目标网段成功`});
        done(infoPage);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除目标网段失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*查询目标网段*/
  queryTargetCidr(qobj: QueryObject, callback: (lists: any, total: number) => void) {
    const msg = new CE.APIQueryNatTargetCidrMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: CE.APICommonQueryReply) => {
      if (rst.success) {
        callback(rst.inventories, rst.total);
      }
    });
  }

  /*增加目标网段*/
  createTargetCidr(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIBatchCreateTargetCidrMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.targetCidrs = infoPage.targetCidrs;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `创建目标网段成功`});
        done(rst.inventories);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `创建目标网段失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*删除目标网段*/
  deleteTargetCidr(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIBatchDeleteTargetCidrMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.targetCidrs = infoPage.targetCidrs;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除目标网段成功`});
        done(infoPage);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除目标网段失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*查询静态路由*/
  queryBatch(qobj: QueryObject, callback: (lists: any, total: number) => void) {
    const msg = new CE.APIQueryCeRouteMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: CE.APICommonQueryReply) => {
      if (rst.success) {
        callback(rst.inventories, rst.total);
      }
    });
  }

  /*增加静态路由*/
  createCeRoute(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIBatchCreateCeRouteMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.destinations = infoPage.destinations;
    msg.nexthop = infoPage.nexthop;
    return this.api.call(msg).subscribe((rst: CE.APICommonQueryReply) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `创建静态路由成功`});
        done(rst.inventories);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `创建静态路由失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*删除静态路由*/
  deleteCeRoute(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIBatchDeleteCeRouteMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.uuids = infoPage.uuids;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除静态路由成功`});
        done(infoPage);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除静态路由失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*更多操作-------------------------------------------------------------》  CPE监控*/

  // 查询监控
  queryMonitorTask(qobj: QueryObject, callback: (datas: any, total: number) => void) {
    const msg = new CE.APIQueryCpeMonitorTaskMsg();
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions;
    msg.count = qobj.count;
    msg.replyWithCount = qobj.replyWidthCount;
    return this.api.call(msg).subscribe((datas: CE.APICommonQueryReply) => {
      if (datas.success && datas && datas.total) {
        callback(datas.inventories, datas.total);
      } else {
        callback([], 0);
      }
    });
  }

  // 查询详情接口信息
  getCePort(ceUuid: string, callback: (datas: any) => void) {
    const msg = new CE.APIGetCePortMsg();
    msg.ceUuid = ceUuid;
    return this.api.call(msg).subscribe((datas: any) => {
      if (datas.success && datas.cePorts) {
        callback(datas.cePorts);
      } else {
        callback([]);
      }
    });
  }

  /*添加监控*/
  addMonitorTask(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APICreateCpeMonitorTaskMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.dev = infoPage.dev;
    msg.targetIp = infoPage.targetIp;
    msg.type = infoPage.type;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `添加监控成功`});
        done(rst);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `添加监控失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*删除监控*/
  deleteMonitorTask(uuid: string, done: (datas) => void, error: () => void = null) {
    const msg = new APIDeleteCpeMonitorTaskMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除监控成功`});
        done(rst);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除监控失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*添加ping*/
  createPing(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APICreateCpePingMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.dev = infoPage.dev;
    msg.targetIp = infoPage.targetIp;
    msg.type = infoPage.type;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        done(rst);
      } else {
        if (error) {
          error();
        }
      }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // 查询ping结果
  getPingResult(infoPage: { [props: string]: string }, callback: (datas: any) => void) {
    const msg = new CE.APIGetCpePingResultMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.taskUuid = infoPage.taskUuid;
    return this.api.call(msg).subscribe((datas: APIReply) => {
      if (datas.success) {
        callback(datas);
      } else {
        callback([]);
      }
    });
  }

  // 获取监控数据
  getMonitorTask(uuid: string, callback: (datas: any) => void) {
    const msg = new CE.APIGetCpeMonitorTaskResultMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((datas: APIReply) => {
      if (datas.success) {
        callback(datas);
      } else {
        callback([]);
      }
    });
  }

  // 查询agent版本
  queryAgentVersion(qobj: QueryObject, callback: (datas: any, total: number) => void) {
    const msg = new CE.APIQueryAgentVersionMsg();
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions;
    msg.count = qobj.count;
    msg.replyWithCount = qobj.replyWidthCount;
    return this.api.call(msg).subscribe((datas: CE.APICommonQueryReply) => {
      if (datas.success && datas && datas.total) {
        callback(datas.inventories, datas.total);
      } else {
        callback([], 0);
      }
    });
  }

  /*更新版本*/
  upgradeAgentVersion(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIUpgradeCeAgentVersionMsg();
    msg.uuid = infoPage.uuid;
    msg.agentVersion = infoPage.agentVersion;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        done(rst);
        this.msgService.addMessage({type: 'success', msg: `更新版本成功`});
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `更新版本失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // 查询所有防火墙
  queryFireWall(qobj: QueryObject, callback: (datas: any, total: number) => void, isModel = false) {
    const msg = isModel ? new CE.APIQueryFirewallModelMsg : new CE.APIQueryFirewallMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy || 'createDate';
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((datas: CE.APICommonQueryReply) => {
      if (datas.success && datas.total) {
        callback(datas.inventories, datas.total);
      } else {
        callback([], 0);
      }
    });
  }

  /*添加防火墙*/
  addListFirewall(infoPage: any, done: (datas) => void, error: () => void = null, isModel = false) {
    let msg = null;
    if (isModel) {
      msg = new CE.APICreateFirewallModelMsg;
      msg.sdwanNetworkUuid = infoPage.sdwanNetworkUuid;
    } else {
      msg = new CE.APIAddListFirewallMsg();
      msg.ceUuid = infoPage.ceUuid;
    }
    msg.firewalls = infoPage.firewalls;
    return this.api.call(msg).subscribe((rst: APIAddListFirewallEvent) => {
      if (rst.success) {
        done(rst.inventories);
        this.msgService.addMessage({type: 'success', msg: `更新防火墙成功`});
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `更新防火墙失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // 城市和cpe的个数
  getCePositionNum(callback: (ret: any) => void) {
    const msg = new CE.APIGetCePositionNumMsg();
    return this.api.call(msg).subscribe((datas: any) => {
      if (datas.success) {
        callback(datas.inventory);
      } else {
        callback({});
      }
    });
  }

  /*查询Qos*/
  queryQos(qobj: QueryObject, callback: (lists: any, total: number) => void, isModel = false) {
    const msg = isModel ? new CE.APIQueryQosModelMsg : new CE.APIQueryQosRuleMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: CE.APICommonQueryReply) => {
      if (rst.success) {
        callback(rst.inventories, rst.total);
      }
    });
  }

  /*增加Qos*/
  createQos(infoPage: any, done: (datas) => void, error: () => void = null, isModel = false) {
    let msg = null;
    if (isModel) {
      msg = new CE.APICreateQosModelMsg;
      msg.sdwanNetworkUuid = infoPage.sdwanNetworkUuid;
    } else {
      msg = new CE.APICreateQosRuleMsg();
      msg.ceUuid = infoPage.ceUuid;
    }
    if (infoPage.srcIp) {
      msg.srcIp = infoPage.srcIp;
    }
    if (infoPage.destIp) {
      msg.destIp = infoPage.destIp;
    }
    if (infoPage.srcPort) {
      msg.srcPort = infoPage.srcPort;
    }
    if (infoPage.destPort) {
      msg.destPort = infoPage.destPort;
    }
    msg.protocol = infoPage.protocol;
    msg.type = infoPage.type;
    msg.level = infoPage.level;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `创建QoS规则成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `创建QoS规则失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*删除Qos*/
  deleteQos(infoPage: any, done: (datas) => void, error: () => void = null, isModel = false) {
    let msg = null;
    if (isModel) {
      msg = new CE.APIDeleteQosModelMsg;
      msg.sdwanNetworkUuid = infoPage.sdwanNetworkUuid;
    } else {
      msg = new CE.APIDeleteQosRuleMsg();
      msg.ceUuid = infoPage.ceUuid;
    }
    msg.uuids = infoPage.uuids;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除QoS规则成功`});
        done(infoPage);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除QoS规则失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*获取Qos带宽*/
  getQosBandwidth(ceUuid: string, callback: (ret: any) => void) {
    const msg = new CE.APIGetQosTypeMsg();
    msg.uuid = ceUuid;
    return this.api.call(msg).subscribe((datas: any) => {
      if (datas.success) {
        callback(datas);
      } else {
        callback(null);
      }
    });
  }

  /*修改Qos带宽*/
  updateQosBandwidth(infoPage: any, done: (datas: any) => void, error: () => void = null) {
    const msg = new CE.APIUpdateQosTypeMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.type = infoPage.type;
    msg.bandwidth = infoPage.bandwidth * 1024 * 1024;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `带宽配置成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `带宽配置失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  getCeBandwidthStatistics(callback: (datas: any) => void) {
    const msg = new CE.APIGetCeBandwidthStatisticsMsg();
    return this.api.call(msg).subscribe((ret: any) => {
      if (ret.success) {
        const inventory = ret.inventory;
        // inventory.total = ret.inventory.total / 1024 / 1024;
        // inventory.total = parseFloat(ret.inventory.total);
        // inventory.used = (inventory.used / 1024 / 1024).toFixed(2);
        callback(inventory);
      } else {
        callback({total: 0, used: 0});
      }
    });
  }

  /*获取配额*/
  getResourceQuota(uuid: string, resourceType: string, callback: (ret: any) => void) {
    const msg = new CE.APIGetResourceQuotaMsg();
    msg.uuid = uuid;
    msg.resourceType = resourceType;
    return this.api.call(msg).subscribe((datas: any) => {
      if (datas.success) {
        callback(datas);
      } else {
        callback(null);
      }
    });
  }

  /*获取模板配额*/
  getResourceModelQuota(callback: (ret: any) => void) {
    const msg = new CE.APIGetResourceModelQuotaMsg();
    return this.api.call(msg).subscribe((datas: any) => {
      if (datas.success) {
        callback(datas);
      } else {
        callback(null);
      }
    });
  }

  /*修改配额设置*/
  updateResourceQuota(infoPage: any, done: (datas: any) => void, error: () => void = null) {
    const msg = new CE.APIUpdateResourceQuotaMsg();
    msg.resourceUuid = infoPage.resourceUuid;
    msg.resourceQuotas = infoPage.resourceQuotas;
    msg.resourceType = infoPage.resourceType;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `修改配额成功`});
        done(rst.inventories);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `修改配额失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*查询策略路径*/
  queryStrategyPath(qobj: QueryObject, callback: (lists: any) => void) {
    const msg = new CE.APIQueryStrategyPathMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: CE.APICommonQueryReply) => {
      if (rst.success) {
        callback(rst.inventories);
      }
    });
  }

  /*修改策略路径*/
  updateStrategyPath(infoPage: any, done: (datas: any) => void, error: () => void = null) {
    const msg = new CE.APIUpdateStrategyPathMsg();
    msg.uuid = infoPage.uuid;
    msg.state = infoPage.state;
    if (infoPage.type) {
      msg.type = infoPage.type;
    }
    if (infoPage.popAssignWans) {
      msg.popAssignWans = infoPage.popAssignWans;
    }
    if (infoPage.loadBalances) {
      msg.loadBalances = infoPage.loadBalances;
    }
    if (infoPage.apps) {
      msg.apps = infoPage.apps;
    }
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `修改策略路径成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `修改策略路径失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*新增应用链路*/
  addApp(infoPage: any, done: (datas: any) => void, error: () => void = null) {
    const msg = new CE.APIAddAppMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.name = infoPage.name;
    msg.popUuid = infoPage.popUuid;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `新增应用链路成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `新增应用链路失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*删除应用链路*/
  batchDeleteApp(infoPage: any, done: (datas) => void, error: () => void = null, isModel = false) {
    let msg = null;
    if (isModel) {
      msg = new CE.APIDeleteAppModelMsg();
      msg.sdwanNetworkUuid = infoPage.sdwanNetworkUuid;
    } else {
      msg = new CE.APIBatchDeleteAppMsg();
      msg.ceUuid = infoPage.ceUuid;
    }
    msg.uuids = infoPage.uuids;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除应用链路成功`});
        done(infoPage);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除应用链路失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*查询应用定义*/
  queryAppDefinition(qobj: QueryObject, callback: (lists: any, total: number) => void, isModel = false) {
    let msg = null;
    msg = isModel ? new CE.APIQueryAppModelDefinitionMsg() : new CE.APIQueryAppDefinitionMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: CE.APICommonQueryReply) => {
      if (rst.success) {
        callback(rst.inventories, rst.total);
      }
    });
  }

  /*新增应用定义*/
  addAppDefinition(infoPage: any, done: (datas: any) => void, error: () => void = null, isModel = false) {
    let msg = null;
    if (isModel) {
      msg = new CE.APIAddAppModelDefinitionMsg();
      msg.appModelUuid = infoPage.appModelUuid;
    } else {
      msg = new CE.APIAddAppDefinitionMsg();
      msg.appUuid = infoPage.appUuid;
    }
    if (infoPage.destIp) {
      msg.destIp = infoPage.destIp;
    }
    if (infoPage.destPort) {
      msg.destPort = infoPage.destPort;
    }
    msg.protocol = infoPage.protocol;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `新增应用定义成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `新增应用定义失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*删除应用定义*/
  batchDeleteAppDefinition(infoPage: any, done: (datas) => void, error: () => void = null, isModel = false) {
    let msg = null;
    if (isModel) {
      msg = new CE.APIBatchDeleteAppModelDefinitionMsg();
      msg.appModelUuid = infoPage.appModelUuid;
    } else {
      msg = new CE.APIBatchDeleteAppDefinitionMsg();
      msg.appUuid = infoPage.appUuid;
    }
    msg.uuids = infoPage.uuids;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除应用定义成功`});
        done(infoPage);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除应用定义失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*查询策略路径消息*/
  getStrategyPath(infoPage: any, callback: (ret: any) => void) {
    const msg = new CE.APIGetStrategyPathMsg();
    msg.uuid = infoPage.uuid;
    msg.type = infoPage.type;
    return this.api.call(msg).subscribe((datas: any) => {
      if (datas.success && datas.total !== 0) {
        callback(datas);
      } else {
        callback(null);
      }
    });
  }

  /*更新cpe-wan信息*/
  refreshCeHeart(uuid: string, done: (datas) => void, error: () => void = null) {
    const msg = new CE.APIRefreshCeWanPortInfoMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((rst: CE.APIRefreshCeHeartBeatEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `刷新成功`});
        done(rst.heartBeat);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `刷新失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*修改策略路径-app*/
  updateApp(infoPage: { [props: string]: string }, done: (datas) => void, error: () => void = null) {
    const msg = new CE.APIUpdateAppMsg();
    msg.uuid = infoPage.uuid;
    msg.name = infoPage.name;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `修改成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `修改失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*查询APP模板*/
  queryAppModel(qobj: QueryObject, callback: (lists: any) => void) {
    const msg = new CE.APIQueryAppModelMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: CE.APICommonQueryReply) => {
      if (rst.success) {
        callback(rst.inventories);
      }
    });
  }

  /*新增APP模板*/
  addNetworkAppModel(infoPage: any, done: (datas: any) => void, error: () => void = null) {
    const msg = new CE.APICreateAppModelMsg();
    msg.sdwanNetworkUuid = infoPage.sdwanNetworkUuid;
    msg.name = infoPage.name;
    msg.haType = infoPage.haType;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `新增应用链路成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `新增应用链路失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*获取Lan-dhcp*/
  getDhcpInfo(uuid: string, callback: (ret: any) => void) {
    const msg = new CE.APIListDhcpLeaseMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((datas: CE.APIListDhcpLeaseReply) => {
      if (datas.success) {
        callback(datas.inventories);
      } else {
        callback(null);
      }
    });
  }

  /*系统重启*/
  restartCe(ce: CE.CeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new CE.APIRestartCeMsg();
    msg.uuid = ce.uuid;
    return this.api.call(msg).subscribe((rst: CE.APIRestartCeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `系统重启成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `系统重启失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*agent重启*/
  restartCeAgent(ce: CE.CeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new CE.APIRestartCeAgentMsg();
    msg.uuid = ce.uuid;
    return this.api.call(msg).subscribe((rst: CE.APIRestartCeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `Agent重启成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `Agent重启失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }


  /* 禁用wan-nat状态 */
  disableNat(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIDisableCePortNatMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.cePortUuid = infoPage.cePortUuid;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `关闭NAT成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `关闭NAT失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  enableNat(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIEnableCePortNatMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.cePortUuid = infoPage.cePortUuid;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `开启NAT成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `开启NAT失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /**
   * 修改APP模板
   */
  updateAppModel(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new CE.APIUpdateAppModelMsg();
    msg.appModelUuid = infoPage.uuid;
    msg.name = infoPage.name;
    msg.haType = infoPage.haType;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `修改应用链路成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `修改应用链路成功`});
      }
    });
  }

  /*变更SD-WAN网络*/
  switchCpeSdwanNetwork(infoPage: any, done: (data: any) => void, error: () => void = null) {
    const msg = new CE.APISwitchCeSdwanNetworkMsg();
    msg.ceUuid = infoPage.ceUuid;
    msg.sdwanNetworkUuid = infoPage.sdwanNetworkUuid;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `变更SD-WAN网络成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `变更SD-WAN网络失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // 重启密钥
  resetCeKey(ceRef: CE.CeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIResetCeSecretKeyMsg();
    msg.ceUuid = ceRef.uuid;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `启用重启密钥成功`});
        done(rst);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `启用重启密钥失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*更新BGP*/
  updateBfd(model: CE.BfdInventory, done: (datas) => void, error: () => void = null) {
    const msg = new CE.APIUpdateBfdMsg();
    msg.uuid = model.uuid;
    msg.bfdState = model.bfdState;
    if (model.recInterval) {msg.recInterval = model.recInterval; }
    if (model.transInterval) {msg.transInterval = model.transInterval; }
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `修改成功`});
        done(rst);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `修改失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*获取Bfd*/
  getBfd(uuid: string, callback: (ret: any) => void) {
    const msg = new CE.APIGetBfdMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((datas: any) => {
      if (datas.success) {
        callback(datas.inventory);
      } else {
        callback(null);
      }
    });
  }

  // 查询Ospf
  queryOspf(qobj: QueryObject, callback: (lists: any, total: number) => void) {
    const msg = new CE.APIQueryOspfMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        callback(rst.inventories, rst.total);
      }
    });
  }

  // 获取interfaceName的接口
  getOspfPort(uuid: string, callback: (ret: any) => void) {
    const msg = new CE.APIListOspfPortMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((datas: any) => {
      if (datas.success) {
        callback(datas.ports);
      } else {
        callback(null);
      }
    });
  }

  enableOspf(datas: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIEnableOspfMsg();
    msg.ceUuid = datas.ceUuid;
    msg.area = datas.area;
    msg.metrics = datas.metrics;
    msg.helloInterval = datas.helloInterval;
    msg.deadInterval = datas.deadInterval;
    msg.interfaceName = datas.interfaceName;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `开启OSPF成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `开启OSPF失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  disableOspf(datas: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIDisableOspfMsg();
    msg.uuid = datas.uuid;
    msg.ceUuid = datas.ceUuid;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `关闭OSPF成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `关闭OSPF失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*获取SDWAN隧道带宽保障*/
  queryCeQosOptimize(qobj: QueryObject, callback: (ret: any, total: number) => void) {
    const msg = new CE.APIQueryCeQosOptimizeMsg();
    msg.conditions = qobj.conditions;
    return this.api.call(msg).subscribe((datas: APICommonQueryReply) => {
      if (datas.success) {
        callback(datas.inventories, datas.total);
      } else {
        callback([], 0);
      }
    });
  }

  // 开启隧道带宽
  enableQosSdwanEnsure(ceUuid: string, done: (datas) => void, error: () => void = null) {
    const msg = new CE.APIEnableQosWanBandwidthEnsureMsg();
    msg.ceUuid = ceUuid;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `开启隧道带宽成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `开启隧道带宽失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }
  // 禁用隧道带宽
  disableQosSdwanEnsure(ceUuid: string, done: (datas) => void, error: () => void = null) {
    const msg = new CE.APIDisableQosWanBandwidthEnsureMsg();
    msg.ceUuid = ceUuid;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `禁用隧道带宽成功`});
        done(rst);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `禁用隧道带宽失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }
  // 开启链路优化
  enableQosPopLoss(ceUuid: string, lossRate: number, done: (datas) => void, error: () => void = null) {
    const msg = new CE.APIEnableQosPopLossMsg();
    msg.ceUuid = ceUuid;
    msg.lossRate = lossRate;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `开启链路优化成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `开启链路优化失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }
  // 禁用链路优化
  disableQosPopLoss(ceUuid: string, done: (datas) => void, error: () => void = null) {
    const msg = new CE.APIDisableQosPopLossMsg();
    msg.ceUuid = ceUuid;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `禁用链路优化成功`});
        done(rst);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `禁用链路优化失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // 获取CPE专线纳管信息
  getCeTunnelManageInfo(uuid: string, callback: (ret: any) => void) {
    const msg = new CE.APIGetCeTunnelManageMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((datas) => {
      if (datas.success) {
        callback(datas.inventory);
      } else {
        callback(null);
      }
    });
  }

  // 获取CPE专线纳管信息
  getSdwanTunnelManageInfo(uuid: string, callback: (ret: any) => void) {
    const msg = new CE.APIGetSdwanTunnelManageMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((datas) => {
      if (datas.success) {
        callback(datas.inventory);
      } else {
        callback(null);
      }
    });
  }

  // CPE专线纳管
  updateCeTunnelManage(infoPage: {[props: string]: string}, done: (datas) => void, error: () => void = null) {
    const msg = new CE.APIUpdateCeTunnelManageMsg();
    msg.uuid = infoPage.uuid;
    msg.state = infoPage.state;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `${infoPage.state === 'Enabled' ? '启用' : '禁用'}成功`});
        done(rst);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `${infoPage.state === 'Enabled' ? '启用' : '禁用'}失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // SDWAN网络专线纳管
  updateSdwanTunnelManage(infoPage: {[props: string]: string}, done: (datas) => void, error: () => void = null) {
    const msg = new CE.APIUpdateSdwanTunnelManageMsg();
    msg.uuid = infoPage.uuid;
    msg.state = infoPage.state;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `${infoPage.state === 'Enabled' ? '启用' : '禁用'}成功`});
        done(rst);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `${infoPage.state === 'Enabled' ? '启用' : '禁用'}失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // 变更链路类型
  changePopType(uuid: string, done: (datas) => void, error: () => void = null) {
    const msg = new APIChangePopToTunnelMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((rst: APIChangePopToTunnelEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `变更链路类型成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `变更链路类型失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  /*Vyos的盒子同步端口信息*/
  syncPortInfo(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new CE.APISyncPortInfoFromClientMsg();
    msg.uuid = infoPage.uuid;
    msg.portNames = infoPage.portNames;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `刷新成功`});
        done(rst);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `刷新失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

  // 重启CPE客户端密码
  resetClientPassword(ceRef: CE.CeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIResetClientPasswordMsg();
    msg.uuid = ceRef.uuid;
    return this.api.call(msg).subscribe((rst: APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `重置CPE客户端密码成功`});
        done(rst);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `重置CPE客户端密码失败`});
        if (error) {
          error();
        }
      } else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }
}
