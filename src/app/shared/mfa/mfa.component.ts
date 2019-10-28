import {Component, OnDestroy, OnInit, ViewChild, ComponentRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LoadingWindowComponent} from '../../m-common/loading-window/loading-window.component';
import { DynamicGenerateService } from '../dynamic-generate.service';
import { MfaService } from './mfa.service';
import { RestApiService } from '../rest-api.service';
@Component({
  selector: 'app-mfa',
  templateUrl: './mfa.component.html',
  styleUrls: ['./mfa.component.styl'],
})
export class MfaComponent implements OnInit, OnDestroy {
  dialogOptions = {
    title: '安全验证',
    width: '500px',
    visible: false,
    changeHeight: 0
  };
  @ViewChild('loading')
    loadingRef: LoadingWindowComponent;
  mfaTypes = [{name: '手机号', value: 'Phone'}, {name: '虚拟MFA', value: 'Google'}, {name: '微信', value: 'WeChat'}];
  isInvalidateCode = false;
  isShow = {
      google: false,
      wechat: false
  };
  interval = 0;
  wechatQRData;
  accountDetailMsg;
  validate;
  requestMsg;
  defaultMfaType;
  mfaForm: FormGroup;
  countDown = null;
  constructor(
    private fb: FormBuilder,
    private dynamic: DynamicGenerateService,
    private mfaService: MfaService,
    private restApi: RestApiService
  ) {
  }

  ngOnInit() {
    this.createForm();
    this.restApi.mfaObservable.subscribe((msg) => {
      if (msg) {
        this.requestMsg = msg;
        this.show();
      }
    });
  }

  createForm() {
    this.mfaForm = this.fb.group({
      currentType: [''],
      bingPhone: [''],
      phoneCode: [''],
      defaultMfaTypePhone: [false],
      gaCode: [''],
      defaultMfaTypeGoogle: [false],
      defaultMfaTypeWeChat: [false],
    });
  }

  show() {
    this.dialogOptions.visible = true;
    this.reset();
    setTimeout(() => {
      this.restApi.mfaMessageObservable.next({success: false});
    });
    this.mfaService.getAccountMFADetail(datas => {
        this.accountDetailMsg = datas;
        if (datas.ga) {
            this.isShow.google = true;
        }
        if (datas.wechat) {
            this.isShow.wechat = true;
        }
        this.mfaForm.patchValue({
          currentType: this.mfaTypes.filter(item => item.value === datas.defaultMfaType)[0].value,
          bingPhone: datas.phone
        });
        this.defaultMfaType = datas.defaultMfaType;
        this.setValidators(this.defaultMfaType);

        if (this.defaultMfaType === 'Phone') {
          this.mfaForm.patchValue({
            defaultMfaTypePhone: true
          });
          this.defaultMfaTypePhone.disable({});
        }else if (this.defaultMfaType === 'Google') {
          this.mfaForm.patchValue({
            defaultMfaTypeGoogle: true
          });
          this.defaultMfaTypeGoogle.disable({});
        }else if (datas.defaultMfaType === 'WeChat') {
          this.mfaForm.patchValue({
            defaultMfaTypeWeChat: true
          });
          this.defaultMfaTypeWeChat.disable({});
          this.mfaService.getWechatQRMsg(data => {
              this.wechatQRData = data;
              this.checkWechatQR(data.ticket);
          });
        }
    });
  }

  reset() {
      this.accountDetailMsg = '';
      this.wechatQRData = '';
      clearInterval(this.interval);
      this.validate = {
          phoneCode: false,
          gaCode: false
      };
      // this.countDown.reset();
      this.isInvalidateCode = false;
      this.isShow = {
          google: false,
          wechat: false
      };
      this.bingPhone.disable({});
      this.mfaForm.reset({
        currentType: '',
        bingPhone: '',
        phoneCode: '',
        defaultMfaTypePhone: false,
        gaCode: '',
        defaultMfaTypeGoogle: false,
        defaultMfaTypeWeChat: false,
      });
      this.countDown = 'init';
  }

  getPhoneCodeDone() {
    this.mfaService.getPhoneCode(this.accountDetailMsg.phone);
  }

  setValidators(item) {
    if (item === 'Phone') {
      this.phoneCode.setValidators([Validators.required]);
      this.phoneCode.updateValueAndValidity();
      this.gaCode.setValidators(null);
      this.gaCode.updateValueAndValidity();
    }else if (item === 'Google') {
      this.phoneCode.setValidators(null);
      this.phoneCode.updateValueAndValidity();
      this.gaCode.setValidators([Validators.required]);
      this.gaCode.updateValueAndValidity();
    }else {
      this.phoneCode.setValidators(null);
      this.phoneCode.updateValueAndValidity();
      this.gaCode.setValidators(null);
      this.gaCode.updateValueAndValidity();
    }
  }

  // 切换类型
  changeMfaType(item) {
    this.setValidators(item);
    this.mfaForm.patchValue({
      currentType: item,
      phoneCode: '',
      gaCode: '',
    });
    this.isInvalidateCode = false;
    if (item === 'WeChat' && this.isShow.wechat) {
      this.mfaService.getWechatQRMsg(data => {
          this.wechatQRData = data;
          this.checkWechatQR(data.ticket);
      });
    }else {
      clearTimeout(this.interval);
    }
  }

  checkWechatQR(ticket) {
      this.mfaService.checkWechatQRScanMsg(ticket, datas => {
          if (datas.scan) {
              clearInterval(this.interval);
              this.requestMsg.mfaType = this.currentType.value;
              this.requestMsg.mfaCode = this.wechatQRData.ticket;
              // mfa 消息回调
              this.dialogOptions.visible = false;

              /*设置默认*/
              this.setDefaultType();
          } else {
              this.interval = setTimeout(() => {
                  this.checkWechatQR(ticket);
              }, 1000);
          }
      });
  }

  refresh() {
      clearInterval(this.interval);
      this.mfaService.getWechatQRMsg(data => {
          this.wechatQRData = data;
          this.checkWechatQR(data.ticket);
      });
  }

  cancel() {
    this.dialogOptions.visible = false;
    this.clearTimer();
  }

  confirm() {
    if (this.currentType.value !== 'WeChat') {
        this.mfaService.validateMfa(this.currentType.value, this.phoneCode.value || this.gaCode.value, data => {
            if (data.passed) {
                this.requestMsg.mfaType = this.currentType.value;
                this.requestMsg.mfaCode = this.phoneCode.value || this.gaCode.value;
                this.restApi.call(this.requestMsg).subscribe(this.restApi.mfaMessageObservable);
                this.restApi.mfaMessageObservable.subscribe((res) => {
                  if (res.success) {
                  }else if (res.error && res.error.code === 'ID.2001') {
                    this.dialogOptions.visible = true;
                    this.isInvalidateCode = true;
                  }
                  this.dialogOptions.visible = false;
                  this.loadingRef.cancel();
                });
                this.dialogOptions.visible = false;
                this.loadingRef.open();

                /*设置默认*/
                this.setDefaultType();
            }else {
                this.isInvalidateCode = true;
            }
        });
    }
  }

  setDefaultType() {
    if (this.currentType.value !== this.defaultMfaType) {
      if ((this.defaultMfaTypePhone.value && this.currentType.value === 'Phone') || (this.defaultMfaTypeGoogle.value && this.currentType.value === 'Google') || (this.defaultMfaTypeWeChat.value && this.currentType.value === 'WeChat')) {
        this.mfaService.updateDefaultMfaType(this.currentType.value, () => {
        });
      }
    }
  }

  clearTimer() {
    clearInterval(this.interval);
  }

  ngOnDestroy() {
    this.onDestroy();
  }
  onDestroy: Function = () => {};
  onClose: Function = () => {};


  get currentType() {
    return this.mfaForm.get('currentType');
  }

  get bingPhone() {
    return this.mfaForm.get('bingPhone');
  }

  get phoneCode() {
    return this.mfaForm.get('phoneCode');
  }

  get defaultMfaTypePhone() {
    return this.mfaForm.get('defaultMfaTypePhone');
  }

  get gaCode() {
    return this.mfaForm.get('gaCode');
  }

  get defaultMfaTypeGoogle() {
    return this.mfaForm.get('defaultMfaTypeGoogle');
  }

  get defaultMfaTypeWeChat() {
    return this.mfaForm.get('defaultMfaTypeGoogle');
  }
}
