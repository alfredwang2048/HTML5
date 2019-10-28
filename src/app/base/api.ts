export enum APIPathFlag {
  Account = 'account',
  Idc = 'idc',
  Spm = 'spm',
  Tunnel = 'tunnel',
  Billing = 'billing',
  Ecp = 'ecp',
  Sdwan = 'sdwan',
  Alarm = 'alarm'
}
export class SessionInventory {
  uuid: string;
  accountUuid: string;
  userUuid: string;
  type: string;
}
export abstract class APIMessage {
  session: SessionInventory;
  flag: APIPathFlag;
  mfaType?: string;
  mfaCode?: string;
  toApiMap(): any {}
}
export class Receipt {
  uuid: string;
  state: string;
  result: any;
  request: any;
}
export class QueryCondition {
  name: string;
  op: string;
  value: string;
}
export class APIQueryMsg extends APIMessage {
  conditions: Array<QueryCondition>;
  limit: number;
  start: number;
  count: boolean;
  sortBy: string;
  groupBy: string;
  sortDirection: string;
  fields: Array<string>;
  replyWithCount = true;
  noError: boolean;
  timeout: number;
}
export class QueryObject {
  start: number;
  limit: number;
  sortBy: string;
  groupBy: string;
  sortDirection: string;
  count: boolean;
  fields: Array<string>;
  replySharedResource: boolean;
  onlySelf: boolean;
  noError: boolean;
  replyWidthCount = true;
  conditions: QueryCondition[];
  addCondition(cond: QueryCondition) {
    if (!this.conditions) {
      this.conditions = [];
    }
    this.conditions.push(cond);
  }
}
export class APIReply {
  success: boolean;
  error: ErrorCode;
}
export class APIEvent {
  success: boolean;
  error: ErrorCode;
}
export class ErrorCode {
  code: string;
  description: string;
  details: string;
}
