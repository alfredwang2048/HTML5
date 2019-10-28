import { Injectable } from '@angular/core';
import {RestApiService} from '../rest-api.service';
import {MsgService} from '../message/msg.service';
import {QueryObject} from '../../base';
import * as Stock from './api';
import {APIQueryCeInDeletedMsg, StockInventory} from './api';
import {APIAddCeMsg} from './api';
import {APIAttachAccountToCeMsg} from './api';
import {APISdwanNetworkReply} from './api';
import {APIDeleteSdwanNetworkMsg} from './api';
import {SdwanInventory} from './api';
import {APICommonQueryReply} from './api';
import {APIInitCeInDeletedMsg} from './api';
import {APIInitCeInDeletedReply} from './api';

@Injectable()
export class StockService {

  constructor(
    private api: RestApiService,
    private msgService: MsgService,
  ) { }

  query(qobj: QueryObject, callback: (lists: Stock.StockInventory[], total: number) => void, OnlyCount = false) {
    const msg = new Stock.APIQueryCeInDeletedMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: Stock.APICommonQueryReply) => {
      if (OnlyCount) {
        callback([], rst.total);
      }else {
        if (rst.success && rst.total) {
          callback(rst.inventories, rst.total);
        }else {
          callback([], 0);
        }
      }
    });
  }

  create(stockRef: StockInventory, done: (data) => void, error: () => void = null) {
    const msg = new Stock.APIAddCeMsg();
    msg.model = stockRef.model;
    msg.esn = stockRef.esn;
    return this.api.call(msg).subscribe((rst: Stock.APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `创建CPE库存成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `创建CPE库存失败`});
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

  attachAccount(stockRef: StockInventory, done: (data) => void, error: () => void = null) {
    const msg = new Stock.APIAttachAccountToCeMsg();
    msg.uuid = stockRef.uuid;
    msg.accountUuid = stockRef.accountUuid;
    msg.name = stockRef.name;
    msg.country = stockRef.country;
    msg.province = stockRef.province;
    msg.city = stockRef.city;
    msg.address = stockRef.address;
    if (stockRef.bandwidthOfferingUuid) {msg.bandwidthOfferingUuid = stockRef.bandwidthOfferingUuid; }
    msg.connectionType = stockRef.connectionType;
    msg.connectionMode = stockRef.connectionMode;
    msg.sdwanNetworkUuid = stockRef.sdwanNetworkUuid;
    if (msg.connectionType === 'SDWAN') {msg.applyTemplate = stockRef.applyTemplate; }
    if (stockRef.l3Protocol) {msg.l3Protocol = stockRef.l3Protocol; }
    return this.api.call(msg).subscribe((rst: Stock.APICeEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `指定用户${stockRef.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `指定用户${stockRef.name}失败`});
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

  delete(refer: StockInventory, done: (datas) => void, error: () => void = null) {
    const msg = new Stock.APIDeleteCeMsg();
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

  init(refer: StockInventory, done: (datas) => void, error: () => void = null) {
    const msg = new Stock.APIInitCeInDeletedMsg();
    msg.uuid = refer.uuid;
    return this.api.call(msg).subscribe((rst: APIInitCeInDeletedReply) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `初始化${refer.name}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `初始化${refer.name}失败`});
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
