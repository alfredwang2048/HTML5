import { Injectable } from '@angular/core';
import * as CE from '../sdwan/api';
import { RestApiService } from '../rest-api.service';
@Injectable()
export class MfaService {
  constructor(
    private restApi: RestApiService
  ) {
  }


  // 获取账户用户认证详情
  getAccountMFADetail(callback: (res) => void) {
    const msg = new CE.APIGetAccountMFADetailMsg();
    return this.restApi.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        callback(rst);
      } else {
        callback([]);
      }
    });
  }

  // 获取微信二维码
  getWechatQRMsg(callback: (res) => void) {
    const msg = new CE.APIGetWechatQRMsg();
    return this.restApi.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        callback(rst);
      } else {
        callback([]);
      }
    });
  }

  // 微信二维码轮询
  checkWechatQRScanMsg(ticket: string, done: (res) => void) {
    const msg = new CE.APICheckWechatQRScanMsg();
    msg.ticket = ticket;
    return this.restApi.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        done(rst);
      } else {
        done([]);
      }
    });
  }

  // 获取手机验证码
  getPhoneCode(phoneNumber: string) {
    const msg = new CE.APIGetVerificationCodeMsg();
    msg.phone = phoneNumber;
    return this.restApi.call(msg).subscribe((rst: any) => {
      if (rst.success) {
      } else {
      }
    });
  }

  // 验证mfa
  validateMfa(mfaType: string, mfaCode: string, callback: (res) => void) {
    const msg = new CE.APIValidateMFAFrontMsg();
    msg.mfaType = mfaType;
    msg.mfaCode = mfaCode;
    return this.restApi.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        callback(rst);
      } else {
        callback(null);
      }
    });
  }
  // 修改默认验证类型
  updateDefaultMfaType(defaultMfaType: string, done: (res) => void) {
    const msg = new CE.APISetDefaultMfaTypeMsg();
    msg.defaultMfaType = defaultMfaType;
    return this.restApi.call(msg).subscribe((rst: any) => {
      if (rst.success) {
        done(rst);
      } else {
        done(null);
      }
    });
  }
}

