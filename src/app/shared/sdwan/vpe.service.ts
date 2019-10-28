import {Injectable} from '@angular/core';
import {RestApiService} from '../rest-api.service';
import {MsgService} from '../message/msg.service';
import {AccountService} from '../account';
import {QueryObject} from '../../base';
import {
  APICreateVpeInterfaceMsg,
  APICreateVpeIpInfoMsg,
  APICreateVpeMsg,
  APIDeleteVpeInterfaceMsg,
  APIDeleteVpeIpInfoMsg,
  APIDeleteVpeMsg,
  APIDisableVpeMsg,
  APIEnableVpeMsg,
  APIGetCeNumOnVpeMsg,
  APIListProvinceNodeMsg,
  APIQueryEndpointMsg,
  APIQuerySwitchMsg,
  APIQuerySwitchPortMsg,
  APIQueryVpeInterfaceMsg,
  APIQueryVpeIpInfoMsg,
  APIQueryVpeMsg, APIReconnectVpeMsg,
  APIUpdateVpeMsg,
  APIVpeEvent,
  APIVpeInterfaceEvent,
  APIVpeInterfaceReply,
  APIVpeIpInfoEvent,
  APIVpeIpInfoReply,
  APIVpeReply,
  InterfaceInventory,
  IpInfoInventory,
  VpeInventory,
  APIGetUsedVpesMsg, VpePeInterfaceInventory, APIQueryL3VpeInterfaceMsg, APIVpePeInterfaceReply,
  APIDeleteL3VpeInterfaceMsg, APIQuerySdwanVpnPortMsg
} from './api';
import {NodeService} from '../node';
import {SdwanService} from './sdwan.service';
import * as CE from './api';

@Injectable()
export class VpeService {

  constructor(private api: RestApiService,
              private msgService: MsgService,
              private nodeService: NodeService,
              private accountMgr: AccountService,
              private sdwanService: SdwanService) {
  }

  /**
   * VPE
   */
  query(qobj: QueryObject, callback: (lists: VpeInventory[], total: number) => void, isSearchNode?: Boolean, OnlyCount = false) {
    const msg = new APIQueryVpeMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIVpeReply) => {
      if (OnlyCount) {
        callback([], rst.total);
      }else {
        const lists = rst.inventories;
        if (rst.success && lists && lists.length) {
          if (isSearchNode) {
            const nodeUuids = [];
            let nodeUuidStr = '';
            lists.forEach((item) => {
              if (!nodeUuids.includes(item.nodeUuid)) {
                nodeUuids.push(item.nodeUuid);
              }
            });
            nodeUuidStr = nodeUuids.join(',');

            const qobj_node = new QueryObject();
            qobj_node.fields = ['uuid', 'name'];
            qobj_node.addCondition({name: 'uuid', op: 'in', value: nodeUuidStr});
            const sub_node = this.nodeService.query(qobj_node, (node_data) => {
              sub_node.unsubscribe();
              lists.forEach((item) => {
                for (let i = 0; i < node_data.length; i++) {
                  if (item.nodeUuid === node_data[i].uuid) {
                    item.nodeName = node_data[i].name;
                  }
                }
              });
              callback(lists, rst.total);
            });
          } else {
            callback(lists, rst.total);
          }
        } else {
          callback([], 0);
        }
      }
    });
  }

  create(refer: VpeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APICreateVpeMsg();
    msg.code = refer.code;
    msg.name = refer.name;
    msg.nodeUuid = refer.nodeUuid;
    msg.address = refer.address;
    msg.manageIp = refer.manageIp;
    msg.sshPort = refer.sshPort;
    msg.username = refer.username;
    msg.password = refer.password;
    msg.type = refer.type;
    return this.api.call(msg).subscribe((rst: APIVpeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `创建VPE${rst.inventory.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `创建VPE${refer.name}失败`});
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

  update(refer: VpeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIUpdateVpeMsg();
    msg.uuid = refer.uuid;
    msg.name = refer.name;
    msg.address = refer.address;
    msg.manageIp = refer.manageIp;
    msg.sshPort = refer.sshPort ? refer.sshPort : '22';
    msg.username = refer.username;
    if (refer.password) {
      msg.password = refer.password;
    }
    return this.api.call(msg).subscribe((rst: APIVpeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `修改VPE ${rst.inventory.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `修改VPE ${refer.name}失败`});
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

  enable(refer: VpeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIEnableVpeMsg();
    msg.uuid = refer.uuid;
    return this.api.call(msg).subscribe((rst: APIVpeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `启用VPE${rst.inventory.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `启用VPE${refer.name}失败`});
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

  disable(refer: VpeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIDisableVpeMsg();
    msg.uuid = refer.uuid;
    return this.api.call(msg).subscribe((rst: APIVpeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `禁用VPE${rst.inventory.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `禁用VPE${refer.name}失败`});
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

  delete(refer: VpeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIDeleteVpeMsg();
    msg.uuid = refer.uuid;
    return this.api.call(msg).subscribe((rst: APIVpeReply) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除VPE ${refer.name}成功`});
        done(refer);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除VPE ${refer.name}失败`});
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

  reconnect(refer: VpeInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIReconnectVpeMsg();
    msg.uuid = refer.uuid;
    return this.api.call(msg).subscribe((rst: APIVpeReply) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `重连VPE ${refer.name}成功`});
        done(refer);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `重连VPE ${refer.name}失败`});
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

  // 查询可用连接点的地区
  getAvailableNodeArea(qobj: QueryObject, callback: (datas: Object) => void) {
    const msg = new APIListProvinceNodeMsg();
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        callback(rst);
      } else {
        callback([]);
      }
    });
  }

  // 查询已指定过的VPE
  getUsedVpes(uuid: string, callback: (datas: any) => void) {
    const msg = new APIGetUsedVpesMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        callback(rst.inventories);
      } else {
        callback([]);
      }
    });
  }

  getCeNumOnVpe(refer: VpeInventory, callback: (lists: any) => void) {
    const msg = new APIGetCeNumOnVpeMsg();
    msg.uuid = refer.uuid;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        callback(rst);
      } else {
        callback([]);
      }
    });
  }


  /**
   * VPE--设置公线网络
   */
  queryVpeIpInfo(qobj: QueryObject, callback: (lists: IpInfoInventory[], total: number) => void, searchVpe?: boolean, OnlyCount = false) {
    const msg = new APIQueryVpeIpInfoMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIVpeIpInfoReply) => {
      if (OnlyCount) {
        callback([], rst.total);
      }else {
        const lists = rst.inventories;
        if (rst.success && lists && lists.length) {
          if (searchVpe) {
            const vpeUuids = [];
            let vpeUuidStr = '';
            lists.forEach((item) => {
              if (!vpeUuids.includes(item.vpeUuid)) {
                vpeUuids.push(item.vpeUuid);
              }

              const ratio = item.usedBandwidth / item.bandwidth;
              if (ratio < 0.7) {
                item.bandwidthRatio = 'label-success';
              } else if (ratio < 0.9) {
                item.bandwidthRatio = 'label-info';
              } else {
                item.bandwidthRatio = 'label-danger';
              }
            });
            vpeUuidStr = vpeUuids.join(',');

            const qobj_vpe = new QueryObject();
            // qobj_vpe.fields = ['uuid', 'name'];
            qobj_vpe.addCondition({name: 'uuid', op: 'in', value: vpeUuidStr});
            const sub_vpe = this.query(qobj_vpe, (vpe_data) => {
              sub_vpe.unsubscribe();
              lists.forEach((item) => {
                for (let i = 0; i < vpe_data.length; i++) {
                  if (item.vpeUuid === vpe_data[i].uuid) {
                    item.vpeName = vpe_data[i].name;
                    item.vpeManageIp = vpe_data[i].manageIp;
                  }
                }
              });
              callback(lists, rst.total);
            });

          } else {
            callback(lists, rst.total);
          }
        } else {
          callback([], 0);
        }
      }
    });
  }

  createVpeIpInfo(refer: IpInfoInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APICreateVpeIpInfoMsg();
    msg.vpeUuid = refer.vpeUuid;
    // msg.number = refer.number;
    msg.type = refer.type;
    msg.publicIp = refer.publicIp;
    msg.bandwidth = refer.bandwidth;
    msg.interfaceName = refer.interfaceName;
    msg.netmask = refer.netmask;
    msg.gateway = refer.gateway;
    return this.api.call(msg).subscribe((rst: APIVpeIpInfoEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `添加公网线路 ${refer.interfaceName}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `添加公网线路 ${refer.interfaceName}失败`});
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

  deleteVpeIpInfo(refer: IpInfoInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIDeleteVpeIpInfoMsg();
    msg.uuid = refer.uuid;
    return this.api.call(msg).subscribe((rst: APIVpeIpInfoReply) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除公网线路 ${refer.typeName}成功`});
        done(refer);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除公网线路 ${refer.typeName}失败`});
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
   * VPE--接口管理
   */
  queryVpeInterface(qobj: QueryObject, callback: (lists: InterfaceInventory[], total: number) => void) {
    const msg = new APIQueryVpeInterfaceMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIVpeInterfaceReply) => {
      const lists = rst.inventories;
      if (rst.success && lists && lists.length) {

        const endpointUuids = [], switchUuids = [], switchPortUuids = [];
        let endpointUuidStr = '', switchUuidStr = '', switchPortUuidStr = '';
        lists.forEach((item) => {
          if (!endpointUuids.includes(item.endpointUuid)) {
            endpointUuids.push(item.endpointUuid);
          }

          if (!switchUuids.includes(item.switchUuid)) {
            switchUuids.push(item.switchUuid);
          }

          if (!switchPortUuids.includes(item.switchPortUuid)) {
            switchPortUuids.push(item.switchPortUuid);
          }
        });
        endpointUuidStr = endpointUuids.join(',');
        switchUuidStr = switchUuids.join(',');
        switchPortUuidStr = switchPortUuids.join(',');

        const qobj_endpoint = new QueryObject();
        qobj_endpoint.fields = ['uuid', 'name'];
        qobj_endpoint.addCondition({name: 'uuid', op: 'in', value: endpointUuidStr});
        const sub_node = this.queryEndpoint(qobj_endpoint, (endpoint_data) => {
          sub_node.unsubscribe();
          lists.forEach((item) => {
            for (let i = 0; i < endpoint_data.length; i++) {
              if (item.endpointUuid === endpoint_data[i].uuid) {
                item.endpointName = endpoint_data[i].name;
              }
            }
          });
        });

        // const qobj_switch = new QueryObject();
        // qobj_switch.fields = ['uuid', 'name'];
        // qobj_switch.addCondition({name: 'uuid', op: 'in', value: switchUuidStr});
        // const sub_switch = this.querySwitch(qobj_switch, (switch_data) => {
        //   sub_switch.unsubscribe();
        //   lists.forEach((item) => {
        //     for (let i = 0; i < switch_data.length; i++) {
        //       if (item.switchUuid === switch_data[i].uuid) {
        //         item.switchName = switch_data[i].name;
        //       }
        //     }
        //   });
        // });

        const qobj_switchPort = new QueryObject();
        qobj_switchPort.addCondition({name: 'uuid', op: 'in', value: switchPortUuidStr});
        const sub_switchPort = this.querySwitchPort(qobj_switchPort, (switchPort_data) => {
          sub_switchPort.unsubscribe();
          lists.forEach((item) => {
            for (let i = 0; i < switchPort_data.length; i++) {
              if (item.switchPortUuid === switchPort_data[i].uuid) {
                item.switchName = switchPort_data[i].switchName;
                item.switchPortName = switchPort_data[i].portName;
              }
            }
          });
        });

        callback(lists, rst.total);
      } else {
        callback([], 0);
      }
    });
  }

  createVpeInterface(refer: InterfaceInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APICreateVpeInterfaceMsg();
    msg.vpeUuid = refer.vpeUuid;
    msg.endpointUuid = refer.endpointUuid;
    msg.switchUuid = refer.switchUuid;
    msg.switchPortUuid = refer.switchPortUuid;
    msg.interfaceName = refer.interfaceName;
    return this.api.call(msg).subscribe((rst: APIVpeInterfaceEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `创建接口 成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `创建接口 失败`});
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

  deleteVpeInterface(refer: InterfaceInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIDeleteVpeInterfaceMsg();
    msg.uuid = refer.uuid;
    return this.api.call(msg).subscribe((rst: APIVpeInterfaceReply) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除接口 ${refer.switchPortName} 成功`});
        done(refer);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除接口 ${refer.switchPortName} 失败`});
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

  // 查询连接点
  queryEndpoint(qobj: QueryObject, callback: (datas: any[], total: number) => void) {
    const msg = new APIQueryEndpointMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        callback(rst.inventories, rst.total);
      } else {
        callback([], 0);
      }
    });
  }

  // 查询交换机
  querySwitch(qobj: QueryObject, callback: (datas: any[], total: number) => void) {
    const msg = new APIQuerySwitchMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        callback(rst.inventories, rst.total);
      } else {
        callback([], 0);
      }
    });
  }

  // 查询交换机端口
  querySwitchPort(qobj: QueryObject, callback: (datas: any[], total: number) => void) {
    const msg = new APIQuerySwitchPortMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        callback(rst.inventories, rst.total);
      } else {
        callback([], 0);
      }
    });
  }

  /**
   * VPE--pe接口管理
   */
  queryVpePeInterface(qobj: QueryObject, callback: (lists: VpePeInterfaceInventory[], total: number) => void) {
    const msg = new APIQueryL3VpeInterfaceMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = qobj.sortBy;
    msg.sortDirection = qobj.sortDirection;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIVpePeInterfaceReply) => {
      const lists = rst.inventories;
      if (rst.success && lists && lists.length) {

        const sdwanNetworkUuids = [], vpeUuids = [];
        let sdwanNetworkUuidStr = '', vpeUuidStr = '';
        lists.forEach((item) => {
          if (!sdwanNetworkUuids.includes(item.sdwanNetworkUuid)) {
            sdwanNetworkUuids.push(item.sdwanNetworkUuid);
          }
          if (!vpeUuids.includes(item.vpeUuid)) {
            vpeUuids.push(item.vpeUuid);
          }
        });
        sdwanNetworkUuidStr = sdwanNetworkUuids.join(',');
        vpeUuidStr = vpeUuids.join(',');

        const qobj_network = new QueryObject();
        qobj_network.fields = ['uuid', 'name'];
        qobj_network.addCondition({name: 'uuid', op: 'in', value: sdwanNetworkUuidStr});
        const sub_network = this.sdwanService.query(qobj_network, (network_data) => {
          sub_network.unsubscribe();
          lists.forEach((item) => {
            for (let i = 0; i < network_data.length; i++) {
              if (item.sdwanNetworkUuid === network_data[i].uuid) {
                item.sdwanNetworkName = network_data[i].name;
              }
            }
          });
        }, false);

        const qobj_vpe = new QueryObject();
        qobj_vpe.fields = ['uuid', 'name'];
        qobj_vpe.addCondition({name: 'uuid', op: 'in', value: vpeUuidStr});
        const sub_vpe = this.query(qobj_vpe, (vpe_data) => {
          sub_vpe.unsubscribe();
          lists.forEach((item) => {
            for (let i = 0; i < vpe_data.length; i++) {
              if (item.vpeUuid === vpe_data[i].uuid) {
                item.vpeName = vpe_data[i].name;
              }
            }
          });
        });


        callback(lists, rst.total);
      } else {
        callback([], 0);
      }
    });
  }

  deleteVpePeInterface(refer: VpePeInterfaceInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIDeleteL3VpeInterfaceMsg();
    msg.uuid = refer.uuid;
    msg.endpointUuid = refer.endpointUuid;
    msg.resourceUuid = refer.resourceUuid;
    return this.api.call(msg).subscribe((rst: APIVpePeInterfaceReply) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除VPE-PE接口 ${refer.uuid} 成功`});
        done(refer);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除VPE-PE接口 ${refer.uuid} 失败`});
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

  // 查询vpnType的port
  querySdwanVpnPort(qobj: QueryObject, callback: (datas: any, total: number) => void) {
    const msg = new APIQuerySdwanVpnPortMsg();
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
      } else {
        callback([], 0);
      }
    });
  }

  getCeBandwidthStatistics(callback: (datas: any) => void) {
    const msg = new CE.APIGetPublicNetworkBandwidthStatisticsMsg();
    return this.api.call(msg).subscribe((ret: any) => {
      if (ret.success) {
        const inventory = ret.inventory;
        // inventory.total = ret.inventory.total / 1024 / 1024;
        // inventory.total = parseInt(ret.inventory.total);
        // inventory.used = (inventory.used / 1024 / 1024).toFixed(2);
        callback(inventory);
      } else {
        callback({total: 0, used: 0});
      }
    });
  }
}
