import { Injectable } from '@angular/core';
import {RestApiService} from '../rest-api.service';
import {MsgService} from '../message/msg.service';
import {QueryObject} from '../../base';
import {
  APIQueryAgentVersionMsg,
  APICreateAgentVersionMsg,
  APIUpdateAgentVersionMsg,
  APIDeleteAgentVersionMsg,
  APIAgentVersionEvent,
  APIAgentVersionReply,
  AgentVersionInventory
} from './api';

@Injectable()
export class AgentVersionService {

  constructor(
    private api: RestApiService,
    private msgService: MsgService,
  ) { }

  query(qobj: QueryObject, callback: (lists: AgentVersionInventory[], total: number) => void) {
    const msg = new APIQueryAgentVersionMsg();
    msg.count = qobj.count === true;
    msg.start = qobj.start;
    msg.limit = qobj.limit;
    msg.fields = qobj.fields;
    msg.sortBy = 'createDate';
    msg.sortDirection = 'desc';
    msg.conditions = qobj.conditions ? qobj.conditions : [];
    return this.api.call(msg).subscribe((rst: APIAgentVersionReply) => {
      if (rst.success && rst.total) {
        callback(rst.inventories, rst.total);
      }else {
        callback([], 0);
      }
    });
  }

  create(versionRef: AgentVersionInventory, done: (data) => void, error: () => void = null) {
    const msg = new APICreateAgentVersionMsg();
    msg.version = versionRef.version;
    msg.description = versionRef.description;
    msg.url = versionRef.url;
    msg.os = versionRef.os;
    return this.api.call(msg).subscribe((rst: APIAgentVersionEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `创建Agent版本成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `创建Agent版本失败`});
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


  delete(versionRef: AgentVersionInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIDeleteAgentVersionMsg();
    msg.uuid = versionRef.uuid;
    return this.api.call(msg).subscribe((rst: APIAgentVersionEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `删除Agent版本${versionRef.version}成功`});
        done(versionRef);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `删除Agent版本${versionRef.version}失败`});
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

  update(versionRef: AgentVersionInventory, done: (datas) => void, error: () => void = null) {
    const msg = new APIUpdateAgentVersionMsg();
    msg.uuid = versionRef.uuid;
    msg.version = versionRef.version;
    msg.description = versionRef.description;
    msg.url = versionRef.url;
    return this.api.call(msg).subscribe((rst: APIAgentVersionEvent) => {
      if (rst.success) {
        this.msgService.addMessage({type: 'success', msg: `更新Agent版本${versionRef.version}成功`});
        done(rst.inventory);
      } else if (rst.error && rst.error.code !== 'ID.2000') {
        this.msgService.addMessage({type: 'error', msg: `更新Agent版本${versionRef.version}失败`});
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
