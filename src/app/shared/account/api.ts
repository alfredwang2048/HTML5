import { APIMessage,
  APIQueryMsg,
  SessionInventory,
  APIPathFlag,
  APIReply } from '../../base/api';

export class AccountExtraInfoInventory {
  uuid: string;
  grade: string;
  createWay: string;
  userUuid: string;
  createDate: string;
  lastOpDate: string;
}
export class AccountInventory {
  uuid: string;
  name: string;
  trueName: string;
  phone: string;
  email: string;
  emailStatus: string;
  phoneStatus: string;
  company: string;
  industry: string;
  status: string;
  type: string;
  expiredClean: boolean;
  createDate: string;
  lastOpDate: string;
  description: string;
  extraInfo: AccountExtraInfoInventory;
}
export class APIQueryAccountMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Account;
  toApiMap(): any {
    return {
      'com.syscxp.account.header.account.APIQueryAccountMsg': this
    };
  }
}
export class APIAccountReply extends APIReply {
  inventories: Array<AccountInventory>;
  total: number;
}
export class BalanceInventory {
  uuid: string;
  cashBalance: number;
  presentBalance: number;
  creditPoint: number;
  createDate: string;
  lastOpDate: string;
}
export class APIGetAccountBalanceMsg extends APIMessage {
  accountUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Billing;
  toApiMap(): any {
      return {
        'com.syscxp.billing.header.balance.APIGetAccountBalanceMsg': this
      };
  }
}
export class APILogOutMsg extends APIMessage {
  sessionUuid: string;
  session: SessionInventory;
  flag = APIPathFlag.Billing;
  toApiMap(): any {
      return {
        'com.syscxp.account.header.identity.APILogOutMsg': this
      };
  }
}
export class APIGetAccountBalanceReply extends APIReply {
  inventory: BalanceInventory;
}
export class APIQueryUserMsg extends APIQueryMsg {
  session: SessionInventory;
  flag = APIPathFlag.Account;
  toApiMap(): any {
    return {
      'com.syscxp.account.header.user.APIQueryUserMsg': this
    };
  }
}
export class APIUserReply extends APIReply {
  inventories: Array<any>;
  total: number;
}
