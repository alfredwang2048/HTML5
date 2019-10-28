import {Injectable} from '@angular/core';
import {RestApiService} from '../rest-api.service';
import {APIReply, QueryObject} from '../../base';
import * as CE from './api';
import {AccountService} from '../account';
import {MsgService} from '../message/msg.service';
import {SdwanService} from './sdwan.service';
import {
  HaInventory,
  APICreateHaGroupMsg,
  APIQueryHaGroupMsg,
  APIUpdateHaGroupMsg,
  APIDeleteHaGroupMsg,
  APICreateServiceCidrForHaGroupMsg,
  APIUpdateServiceCidrForHaGroupMsg,
  APIGetHaGroupMsg,
  APIHaReply,
  APIHaEvent,
  APIBatchCreateServiceCidrForHaGroupMsg,
  APIBatchDeleteServiceCidrForHaGroupMsg,
  APIQueryCePortMsg,
  APIQueryLanInfoMsg,
  LanInfoInventory,
  APILanInfoReply,
  CePortInventory,
  APICePortReply,
  APISyncHaInfoFromClientMsg
} from './api';
import {APIQueryAlarmLogReply} from './api';
import {APIQueryAlarmLogMsg} from './api';
import {AlarmHistoryInventory} from './api';
import {PublicNetworkMonitorService} from './publicNetworkMonitor.service';

@Injectable()
export class HaService {

  constructor(private api: RestApiService,
              private actMgr: AccountService,
              private msgService: MsgService,
              private networkService: SdwanService,
              private publicNetworkMonitorService: PublicNetworkMonitorService) {
  }

  query(qobj: QueryObject, callback: (lists: HaInventory[], total: number) => void, searchAccount: Boolean = true, searchSdwan: Boolean = true) {
    const msg = new APIQueryHaGroupMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIHaReply) => {
      const lists = rst.inventories;
      if (rst.success && lists && lists.length) {
        const accountUuid = [], ceUuid = [], sdwanNetworkUuid = [];
        lists.forEach((item) => {
          if (item.haGroupCeRefs.length === 2) {
            if (item.haGroupCeRefs[0].priority < item.haGroupCeRefs[1].priority) {
              const haGroupCeRefs = [];
              haGroupCeRefs.push(item.haGroupCeRefs[1]);
              haGroupCeRefs.push(item.haGroupCeRefs[0]);
              item.haGroupCeRefs = haGroupCeRefs;
            }
          }
          item.haGroupCeRefs.forEach((ceRefs) => {
            ceUuid.push(ceRefs.ceUuid);
          });
          accountUuid.push(item.accountUuid);
          sdwanNetworkUuid.push(item.sdwanNetworkUuid);
        });

        if (searchAccount) {
          const qobjAccount = new QueryObject();
          qobjAccount.fields = ['name', 'company', 'uuid'];
          qobjAccount.addCondition({name: 'uuid', op: 'in', value: accountUuid.join(',')});
          this.actMgr.query(qobjAccount, (accounts, total) => {
            lists.forEach((item, index) => {
              for (let i = 0; i < accounts.length; i++) {
                if (item.accountUuid === accounts[i].uuid) {
                  item['accountName'] = accounts[i].name;
                  item['company'] = accounts[i].company;
                  lists[index] = item;
                  break;
                }
              }
            });
          });
        }
        if (searchSdwan) {
          const qobjNetwork = new QueryObject();
          qobjNetwork.addCondition({name: 'uuid', op: 'in', value: sdwanNetworkUuid.join(',')});
          this.networkService.query(qobjNetwork, (network) => {
            lists.forEach((item) => {
              for (let i = 0; i < network.length; i++) {
                if (item.sdwanNetworkUuid === network[i].uuid) {
                  item['sdwanNetworkName'] = network[i].name;
                  break;
                }
              }
            });
          }, false);
        }
        const qobjCe = new QueryObject();
        qobjCe.addCondition({name: 'uuid', op: 'in', value: ceUuid.join(',')});
        this.queryCe(qobjCe, (ce) => {
          lists.forEach((item) => {
            for (let i = 0; i < ce.length; i++) {
              if (item.haGroupCeRefs.length === 1) {
                if (item.haGroupCeRefs[0].ceUuid === ce[i].uuid) {
                  item.haGroupCeRefs[0]['ceName'] = ce[i].name;
                  item.haGroupCeRefs[0]['ce'] = ce[i];
                  break;
                }
              }
              if (item.haGroupCeRefs.length > 1) {
                if (item.haGroupCeRefs[0].ceUuid === ce[i].uuid) {
                  item.haGroupCeRefs[0]['ceName'] = ce[i].name;
                  item.haGroupCeRefs[0]['ce'] = ce[i];
                  if (item.haGroupCeRefs[1].ceName) {
                    break;
                  }
                }
                if (item.haGroupCeRefs[1].ceUuid === ce[i].uuid) {
                  item.haGroupCeRefs[1]['ceName'] = ce[i].name;
                  item.haGroupCeRefs[1]['ce'] = ce[i];
                  if (item.haGroupCeRefs[0].ceName) {
                    break;
                  }
                }
              }
            }
          });
          callback(lists, rst.total);
        });
      } else {
        callback([], 0);
      }
    });
  }

  create(refer: HaInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APICreateHaGroupMsg();
    msg.accountUuid = refer.accountUuid;
    msg.name = refer.name;
    msg.vip = refer.vip;
    msg.vrid = refer.vrid;
    msg.sdwanNetworkUuid = refer.sdwanNetworkUuid;
    msg.ces = refer.ces;
    return this.api.call(msg).subscribe((rst: APIHaEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `创建高可用HA${rst.inventory.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `创建高可用HA${refer.name}失败`});
        if (error) {
          error();
        }
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

  update(refer: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIUpdateHaGroupMsg();
    msg.uuid = refer.uuid;
    msg.name = refer.name;
    msg.vip = refer.vip;
    msg.vrid = refer.vrid;
    msg.sdwanNetworkUuid = refer.sdwanNetworkUuid;
    msg.ces = refer.ces;
    return this.api.call(msg).subscribe((rst: APIHaEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `修改${rst.inventory.name}成功`});
        const ret = rst.inventory;
        ret.haGroupCeRefs[0].ceName = '';
        if (ret.haGroupCeRefs[1]) {
          ret.haGroupCeRefs[1].ceName = '';
        }
        if (refer.ceInfo.length) {
          refer.ceInfo.forEach((item) => {
            if (item.uuid === ret.haGroupCeRefs[0].ceUuid) {
              ret.haGroupCeRefs[0].ceName = item.name;
            } else if (ret.haGroupCeRefs[1]) {
              if (item.uuid === ret.haGroupCeRefs[1].ceUuid) {
                ret.haGroupCeRefs[1].ceName = item.name;
              }
            }
          });
        }
        done(ret);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `修改${refer.name}失败`});
        if (error) {
          error();
        }
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

  delete(refer: HaInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIDeleteHaGroupMsg();
    msg.uuid = refer.uuid;
    return this.api.call(msg).subscribe((rst: APIHaReply) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除${refer.name}成功`});
        done(refer);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除${refer.name}失败`});
        if (error) {
          error();
        }
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

  createCidrForHa(refer: HaInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APICreateServiceCidrForHaGroupMsg();
    msg.uuid = refer.uuid;
    msg.cidr = refer.cidr;
    return this.api.call(msg).subscribe((rst: APIHaEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `设置业务网段${rst.inventory.cidr}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `设置业务网段${refer.cidr}失败`});
        if (error) {
          error();
        }
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

  updateCidrForHa(refer: HaInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIUpdateServiceCidrForHaGroupMsg();
    msg.uuid = refer.uuid;
    msg.cidr = refer.cidr;
    return this.api.call(msg).subscribe((rst: APIHaEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `设置业务网段${rst.inventory.cidr}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `设置业务网段${refer.cidr}失败`});
        if (error) {
          error();
        }
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

  queryCe(qobj: QueryObject, callback: (lists: CE.CeInventory[], total: number) => void) {
    const msg = new CE.APIQueryCeMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: CE.APICeReply) => {
      const ces = rst.inventories;
      if (rst.success && ces && ces.length) {
        callback(ces, rst.total);
      } else {
        callback([], 0);
      }
    });
  }

  getHaGroup(uuid: string, callback: (datas: any) => void) {
    const msg = new CE.APIGetHaGroupMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((datas: APIReply) => {
      if (datas.success) {
        callback(datas);
      } else {
        callback([]);
      }
    });
  }

  queryAlarm(qobj: QueryObject, callback: (lists: any, total: number) => void, OnlyCount = false, searchPublicNetwork?: boolean) {
    const msg = new APIQueryAlarmLogMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: any) => {
      if (OnlyCount) {
        callback([], rst.total);
      } else {
        const lists = rst.inventories;
        if (rst.success && lists && lists.length) {
          const sdwanUuid = [];
          lists.forEach(item => {
            if (item.status === 'PROBLEM') {
              item.translateStatus = '报警';
              item.class = 'label-danger';
            } else if (item.status === 'OK') {
              item.translateStatus = '已恢复';
              item.class = 'label-success';
            } else if (item.status === 'HINT') {
              item.translateStatus = '提示';
              item.class = 'label-warning';
            }
            if (sdwanUuid.indexOf(item.productUuid) === -1) {
              sdwanUuid.push(item.productUuid);
            }
          });
          const qobjCe = new QueryObject();
          qobjCe.addCondition({name: 'uuid', op: 'in', value: sdwanUuid.join(',')});

          if (searchPublicNetwork) {
            qobjCe.fields = ['uuid', 'publicIp'];
            this.publicNetworkMonitorService.query(qobjCe, (datas, total) => {
              if (total > 0) {
                datas.forEach(item => {
                  for (let i = 0; i < lists.length; i++) {
                    if (item.uuid === lists[i].productUuid) {
                      lists[i].publicIp = item.publicIp;
                    }
                  }
                });
              }
              callback(lists, rst.total);
            });
          } else {
            qobjCe.fields = ['uuid', 'name'];
            this.queryCe(qobjCe, (ce, total) => {
              if (total > 0) {
                ce.forEach(item => {
                  for (let i = 0; i < lists.length; i++) {
                    if (item.uuid === lists[i].productUuid) {
                      lists[i].productName = item.name;
                    }
                  }
                });
              }
              callback(lists, rst.total);
            });
          }
        } else {
          callback([], 0);
        }
      }
    });
  }

  /*增加业务网段*/
  createServiceCidr(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIBatchCreateServiceCidrForHaGroupMsg();
    msg.haGroupUuid = infoPage.haGroupUuid;
    msg.cidr = infoPage.cidr;
    return this.api.call(msg).subscribe((rst: APIHaEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `创建业务网段成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `创建业务网段失败`});
        if (error) {
          error();
        }
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

  /*删除业务网段*/
  deleteServiceCidr(infoPage: any, done: (datas) => void, error: () => void = null) {
    const msg = new APIBatchDeleteServiceCidrForHaGroupMsg();
    msg.haGroupUuid = infoPage.haGroupUuid;
    msg.uuids = infoPage.uuids;
    return this.api.call(msg).subscribe((rst: APIHaEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除目标网段成功`});
        done(infoPage);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除目标网段失败`});
        if (error) {
          error();
        }
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

  getCeFault(limit: number, callback: (datas: any) => void) {
    const msg = new CE.APIGetCeFaultMsg();
    msg.limit = limit;
    return this.api.call(msg).subscribe((datas: any) => {
      if (datas.success) {
        callback(datas.inventories);
      } else {
        callback([]);
      }
    });
  }

  queryCePort(qobj: QueryObject, callback: (lists: CePortInventory[], total: number) => void) {
    const msg = new APIQueryCePortMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APICePortReply) => {
      const lists = rst.inventories;
      if (rst.success && lists && lists.length) {
        callback(lists, rst.total);
      } else {
        callback([], 0);
      }
    });
  }

  queryLanInfo(qobj: QueryObject, callback: (lists: LanInfoInventory[], total: number) => void) {
    const msg = new APIQueryLanInfoMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APILanInfoReply) => {
      const lists = rst.inventories;
      if (rst.success && lists && lists.length) {
        callback(lists, rst.total);
      } else {
        callback([], 0);
      }
    });
  }

  syncHaInfoFromClient(uuid: string, done: (datas: any) => void, error: () => void = null) {
    const msg = new APISyncHaInfoFromClientMsg();
    msg.uuid = uuid;
    return this.api.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `刷新成功`});
        done(rst.inventory);
      }else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `刷新失败`});
        if (error) {
          error();
        }
      }else { if (error) { error(); } }
    }, () => {
      if (error) {
        error();
      }
    });
  }

}
