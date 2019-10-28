import {Injectable} from '@angular/core';
import {RestApiService} from '../rest-api.service';
import {MsgService} from '../message/msg.service';
import {AccountService} from '../account';
import {
  SdwanInventory,
  APISdwanNetworkReply,
  APIQuerySdwanNetworkMsg,
  APIDeleteSdwanNetworkMsg,
  APICreateSdwanNetworkMsg,
  APISdwanNetworkEvent,
  APIQueryL3NetworkMsg,
  APIUpdateSdwanNetworkMsg,
  APIQueryResourceManagerRoleMsg,
  APIQueryManagerRoleReply,
  APISetResourceManagerRoleMsg,
  APISetResourceManagerEvent,
  APIQueryAccountManagerRoleMsg,
  APIAssignVpeForSdwanMsg,
  APIListVpeForSdwanMsg, APIQueryAlarmLogMsg, APIQueryAlarmLogReply, AlarmHistoryInventory
} from './api';
import {QueryObject} from '../../base';

@Injectable()
export class SdwanService {

  constructor(private api: RestApiService,
              private msgService: MsgService,
              private accountMgr: AccountService) {
  }

  query(qobj: QueryObject, callback: (lists: SdwanInventory[], total: number) => void, searchAccount: Boolean = true) {
    const msg = new APIQuerySdwanNetworkMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APISdwanNetworkReply) => {
      const lists = rst.inventories;
      if (rst.success && lists && lists.length) {
        if (searchAccount) {
          const accountUuid = [];
          let accountUuidStr = '';
          lists.forEach((item, index) => {
            accountUuid.push(item.accountUuid);
          });
          accountUuidStr = accountUuid.join(',');
          const qobjAccount = new QueryObject();
          qobjAccount.addCondition({name: 'uuid', op: 'in', value: accountUuidStr});
          this.accountMgr.query(qobjAccount, (accounts, total) => {
            lists.forEach((item, index) => {
              for (let i = 0; i < accounts.length; i++) {
                if (item.accountUuid === accounts[i].uuid) {
                  item['accountName'] = accounts[i].name;
                  item['companyName'] = accounts[i].company;
                  lists[index] = item;
                  break;
                }
              }
            });
            callback(lists, rst.total);
          });
        }else {
          callback(lists, rst.total);
        }
      } else {
        callback([], 0);
      }
    });
  }

  queryL3Network(qobj: QueryObject, callback: (lists: any, total: number) => void) {
    const msg = new APIQueryL3NetworkMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: any) => {
      const lists = rst.inventories;
      if (rst.success && lists && lists.length) {
        callback(lists, rst.total);
      } else {
        callback([], 0);
      }
    });
  }

  create(refer: SdwanInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APICreateSdwanNetworkMsg();
    msg.accountUuid = refer.accountUuid;
    msg.l3networkUuid = refer.l3networkUuid;
    msg.name = refer.name;
    msg.cidr = refer.cidr;
    msg.purpose = refer.purpose;
    msg.description = refer.description;
    return this.api.call(msg).subscribe((rst: APISdwanNetworkEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `创建SD-WAN网络${rst.inventory.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `创建SD-WAN网络${refer.name}失败`});
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

  update(refer: SdwanInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIUpdateSdwanNetworkMsg();
    msg.uuid = refer.uuid;
    msg.name = refer.name;
    msg.purpose = refer.purpose;
    msg.description = refer.description;
    return this.api.call(msg).subscribe((rst: APISdwanNetworkEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `修改SD-WAN网络${rst.inventory.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `修改SD-WAN网络${refer.name}失败`});
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

  delete(refer: SdwanInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIDeleteSdwanNetworkMsg();
    msg.uuid = refer.uuid;
    return this.api.call(msg).subscribe((rst: APISdwanNetworkReply) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除${refer.name}成功`});
        done(refer);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除${refer.name}失败`});
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

  getListVpeForSdwan(refer: SdwanInventory, callback: (lists: any) => void) {
    const msg = new APIListVpeForSdwanMsg();
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

  assignVpe(refer: SdwanInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIAssignVpeForSdwanMsg();
    msg.sdwanNetworkUuid = refer.sdwanNetworkUuid;
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

  queryResourceManagerRole(qobj: QueryObject, callback: (datas: any) => void) {
    const msg = new APIQueryResourceManagerRoleMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIQueryManagerRoleReply) => {
      if (rst.success && rst.inventories) {
        if (rst.inventories.length) {
          const userUuids = [];
          for (let i = 0; i < rst.inventories.length; i++) {
            userUuids.push(rst.inventories[i].userUuid);
          }
          const qobjUser = new QueryObject();
          qobjUser.addCondition({name: 'uuid', op: 'in', value: userUuids.join(',')});
          this.accountMgr.queryUser(qobjUser, (users) => {
            users.forEach((item) => {
              rst.inventories.forEach((i) => {
                if (i.userUuid === item.uuid) {
                  i.userName = item.name;
                }
              });
            });
            callback(rst.inventories);
          });
        } else {
          callback([]);
        }
      }
    });
  }

  queryAccountManagerRole(qobj: QueryObject, callback: (datas: any) => void) {
    const msg = new APIQueryAccountManagerRoleMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIQueryManagerRoleReply) => {
      if (rst.success && rst.inventories) {
        if (rst.inventories.length) {
          callback(rst.inventories);
        } else {
          callback([]);
        }
      }
    });
  }

  setResourceManager(infoPage: any, done: () => void) {
    const msg = new APISetResourceManagerRoleMsg();
    msg.resourceUuid = infoPage.resourceUuid;
    msg.resourceType = infoPage.resourceType;
    if (infoPage.businessManagerUuid) {
      msg.businessUserUuid = infoPage.businessManagerUuid;
    }
    if (infoPage.projectManagerUuid) {
      msg.projectUserUuid = infoPage.projectManagerUuid;
    }
    if (infoPage.customerManagerUuid) {
      msg.customerUserUuid = infoPage.customerManagerUuid;
    }
    return this.api.call(msg).subscribe((rst: APISetResourceManagerEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `设置负责人成功`});
        done();
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `设置负责人失败`});
      }
    });
  }
}
