import {AfterContentChecked, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CeService} from '../../../shared/sdwan/ce.service';

@Component({
  selector: 'app-ce-update-lan',
  templateUrl: './ce-update-lan.component.html',
  styleUrls: ['./ce-update-lan.component.styl']
})
export class CeUpdateLanComponent implements OnInit, AfterContentChecked {

  selectedPort: any;
  @Output()
  done: EventEmitter<any>  = new EventEmitter<any>();

  updateCeLanForm: FormGroup;
  dhcps = [{name: '启用', value: 'true'}, {name: '禁用', value: 'false'}];
  states = [{name: '启用', value: 'Enabled'}, {name: '禁用', value: 'Disabled'}];
  dhcpStatuss = [{name: '标准', value: 'none'}, {name: '主', value: 'primary'}, {name: '从', value: 'secondary'}, {name: '中继', value: 'relay'}];
  isDisableGateway = {
    number1: true,
    number2: false
  };

  dialogOptions = {
    title: 'LAN配置',
    width: '630px',
    visible: false,
    changeHeight: 0
  };

  constructor(
    private fb: FormBuilder,
    private ceService: CeService
  ) { }

  openDialog(current) {
    this.selectedPort = current;
    this.dialogOptions.visible = true;
    this.resetForm();
    this.changeState();
  }

  ngOnInit() {
    this.createForm();
  }

  ngAfterContentChecked() {
    this.dialogOptions.changeHeight ++;
  }

  createForm() {
    this.updateCeLanForm = this.fb.group({
      state: [''],
      dhcp: [''],
      localIp: this.fb.group({
        number1: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number2: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number3: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number4: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      }),
      netmask: this.fb.group({
        number1: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number2: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number3: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number4: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      }),
      startIp: this.fb.group({
        number1: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number2: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number3: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number4: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      }),
      endIp: this.fb.group({
        number1: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number2: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number3: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number4: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      }),
      gateway: this.fb.group({
        number1: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number2: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number3: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number4: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      }),
      dns: this.fb.group({
        number1: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number2: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number3: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number4: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      }),
      dhcpStatus: ['', Validators.required],
      dhcpPeerIp: this.fb.group({
        number1: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number2: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number3: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number4: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      }),
      dhcpRelayIp: this.fb.group({
        number1: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number2: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number3: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number4: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      }),
    });
  }

  resetForm() {
    this.updateCeLanForm.reset({
      state: this.selectedPort.state,
      dhcp: this.selectedPort.dhcp ? 'true' : 'false',
      dns: this.selectedPort.dns ? {
        number1: this.selectedPort.dns.split('.')[0],
        number2: this.selectedPort.dns.split('.')[1],
        number3: this.selectedPort.dns.split('.')[2],
        number4: this.selectedPort.dns.split('.')[3]
      } : {
        number1: '',
        number2: '',
        number3: '',
        number4: ''
      },
      localIp: this.selectedPort.localIp ? {
        number1: this.selectedPort.localIp.split('.')[0],
        number2: this.selectedPort.localIp.split('.')[1],
        number3: this.selectedPort.localIp.split('.')[2],
        number4: this.selectedPort.localIp.split('.')[3]
      } : {
        number1: '',
        number2: '',
        number3: '',
        number4: ''
      },
      netmask: this.selectedPort.netmask ? {
        number1: this.selectedPort.netmask.split('.')[0],
        number2: this.selectedPort.netmask.split('.')[1],
        number3: this.selectedPort.netmask.split('.')[2],
        number4: this.selectedPort.netmask.split('.')[3]
      } : {
        number1: '',
        number2: '',
        number3: '',
        number4: ''
      },
      startIp: this.selectedPort.startIp ? {
        number1: this.selectedPort.startIp.split('.')[0],
        number2: this.selectedPort.startIp.split('.')[1],
        number3: this.selectedPort.startIp.split('.')[2],
        number4: this.selectedPort.startIp.split('.')[3]
      } : {
        number1: '',
        number2: '',
        number3: '',
        number4: ''
      },
      endIp: this.selectedPort.endIp ? {
        number1: this.selectedPort.endIp.split('.')[0],
        number2: this.selectedPort.endIp.split('.')[1],
        number3: this.selectedPort.endIp.split('.')[2],
        number4: this.selectedPort.endIp.split('.')[3]
      } : {
        number1: '',
        number2: '',
        number3: '',
        number4: ''
      },
      gateway: this.selectedPort.gateway ? {
        number1: this.selectedPort.gateway.split('.')[0],
        number2: this.selectedPort.gateway.split('.')[1],
        number3: this.selectedPort.gateway.split('.')[2],
        number4: this.selectedPort.gateway.split('.')[3]
      } : {
        number1: '',
        number2: '',
        number3: '',
        number4: ''
      },
      dhcpStatus: this.selectedPort.dhcpStatus,
      dhcpPeerIp: this.selectedPort.dhcpPeerIp ? {
        number1: this.selectedPort.dhcpPeerIp.split('.')[0],
        number2: this.selectedPort.dhcpPeerIp.split('.')[1],
        number3: this.selectedPort.dhcpPeerIp.split('.')[2],
        number4: this.selectedPort.dhcpPeerIp.split('.')[3]
      } : {
        number1: '',
        number2: '',
        number3: '',
        number4: ''
      },
      dhcpRelayIp: this.selectedPort.dhcpRelayIp ? {
        number1: this.selectedPort.dhcpRelayIp.split('.')[0],
        number2: this.selectedPort.dhcpRelayIp.split('.')[1],
        number3: this.selectedPort.dhcpRelayIp.split('.')[2],
        number4: this.selectedPort.dhcpRelayIp.split('.')[3]
      } : {
        number1: '',
        number2: '',
        number3: '',
        number4: ''
      },
    });
    if (this.selectedPort.gateway) {
      this.gateway.get('number1').disable({});
      this.gateway.get('number2').disable({});
      this.gateway.get('number3').disable({});
      this.gateway.get('number4').disable({});
    }
  }

  changeLocalIp() {
    for (let i = 1; i < 5; i++) {
      const name = String('number' + i);
      if (this.localIp.get(name) && this.localIp.get(name).valid && this.netmask.get(name).valid && this.netmask.value[name] === '255') {
        this.startIp.get(name).patchValue(this.localIp.value[name]);
        this.endIp.get(name).patchValue(this.localIp.value[name]);
      }

      if (this.dhcpStatus.value === 'none' && this.localIp.get(name) && this.localIp.get(name).valid) {
        this.gateway.get(name).patchValue(this.localIp.value[name]);
        this.gateway.get(name).disable({});
      }
    }
  }

  changeState() {
    if (this.state.value === 'Enabled') {
      // this.localIp.setValidators(Validators.required);
      for (let i = 1; i <= 4; i++) {
        const name = String('number' + i);
        this.localIp.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
        this.localIp.get(name).updateValueAndValidity();
        this.netmask.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
        this.netmask.get(name).updateValueAndValidity();
      }
    }else {
      // this.localIp.setValidators(null);
      for (let i = 1; i <= 4; i++) {
        const name = String('number' + i);
        this.localIp.get(name).setValidators(null);
        this.localIp.get(name).updateValueAndValidity();
        this.netmask.get(name).setValidators(null);
        this.netmask.get(name).updateValueAndValidity();
      }
    }
    this.localIp.updateValueAndValidity();
    this.netmask.updateValueAndValidity();
    this.changeDhcps();
  }

  changeDhcps() {
    if (this.dhcp.value === 'true' && this.state.value === 'Enabled') {
      for (let i = 1; i <= 4; i++) {
        const name = String('number' + i);
        this.startIp.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
        this.startIp.get(name).updateValueAndValidity();
        this.endIp.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
        this.endIp.get(name).updateValueAndValidity();
        this.gateway.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
        this.gateway.get(name).updateValueAndValidity();
        this.dns.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
        this.dns.get(name).updateValueAndValidity();
      }
    }else {
      for (let i = 1; i <= 4; i++) {
        const name = String('number' + i);
        this.startIp.get(name).setValidators(null);
        this.startIp.get(name).updateValueAndValidity();
        this.endIp.get(name).setValidators(null);
        this.endIp.get(name).updateValueAndValidity();
        this.gateway.get(name).setValidators(null);
        this.gateway.get(name).updateValueAndValidity();
        this.dns.get(name).setValidators(null);
        this.dns.get(name).updateValueAndValidity();
      }
    }
    this.changeDhcpsStatus();
  }

  changeDhcpsStatus() {
    setTimeout(() => {

      if (this.dhcp.value === 'true' && this.state.value === 'Enabled') {
        if (this.dhcpStatus.value === 'relay') {
          for (let i = 1; i < 5; i++) {
            const name = String('number' + i);
            // 取消必选字段判定
            this.dhcpPeerIp.get(name).setValidators(null);
            this.dhcpPeerIp.get(name).updateValueAndValidity();
            this.startIp.get(name).setValidators(null);
            this.startIp.get(name).updateValueAndValidity();
            this.endIp.get(name).setValidators(null);
            this.endIp.get(name).updateValueAndValidity();
            this.gateway.get(name).setValidators(null);
            this.gateway.get(name).updateValueAndValidity();
            this.dns.get(name).setValidators(null);
            this.dns.get(name).updateValueAndValidity();
            // 打开必选判定
            this.dhcpRelayIp.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
            this.dhcpRelayIp.get(name).updateValueAndValidity();
          }
        } else {
            for (let i = 1; i < 5; i++) {
              const name = String('number' + i);
              // 打开必选判定
              this.startIp.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
              this.startIp.get(name).updateValueAndValidity();
              this.endIp.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
              this.endIp.get(name).updateValueAndValidity();
              this.gateway.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
              this.gateway.get(name).updateValueAndValidity();
              this.dns.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
              this.dns.get(name).updateValueAndValidity();
              // 取消必选
              this.dhcpRelayIp.get(name).setValidators(null);
              this.dhcpRelayIp.get(name).updateValueAndValidity();

              // 等于 none类型 锁定网关
              if (this.dhcpStatus.value === 'none') {
                this.dhcpPeerIp.get(name).setValidators(null);
                this.dhcpPeerIp.get(name).updateValueAndValidity();
                if (this.localIp.get(name) && this.localIp.get(name).valid) {
                  this.gateway.get(name).patchValue(this.localIp.value[name]);
                  this.gateway.get(name).disable({});
                }
              }else {
                this.dhcpPeerIp.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
                this.dhcpPeerIp.get(name).updateValueAndValidity();
                this.gateway.get(name).enable({});
              }
            }
        }
      }
    });
  }

  get isOpenPort() {
    return this.updateCeLanForm.get('isOpenPort');
  }

  get dns() {
    return this.updateCeLanForm.get('dns');
  }

  get netmask() {
    return this.updateCeLanForm.get('netmask');
  }

  get dhcp() {
    return this.updateCeLanForm.get('dhcp');
  }

  get localIp() {
    return this.updateCeLanForm.get('localIp');
  }

  get state() {
    return this.updateCeLanForm.get('state');
  }

  get startIp() {
    return this.updateCeLanForm.get('startIp');
  }

  get endIp() {
    return this.updateCeLanForm.get('endIp');
  }

  get gateway() {
    return this.updateCeLanForm.get('gateway');
  }

  get dhcpStatus() {
    return this.updateCeLanForm.get('dhcpStatus');
  }

  get dhcpPeerIp() {
    return this.updateCeLanForm.get('dhcpPeerIp');
  }

  get dhcpRelayIp() {
    return this.updateCeLanForm.get('dhcpRelayIp');
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const localIp = this.localIp.value.number1 + '.' + this.localIp.value.number2 + '.' + this.localIp.value.number3 + '.' + this.localIp.value.number4;
    const netmask = this.netmask.value.number1 + '.' + this.netmask.value.number2 + '.' + this.netmask.value.number3 + '.' + this.netmask.value.number4;
    const startIp = this.startIp.value.number1 + '.' + this.startIp.value.number2 + '.' + this.startIp.value.number3 + '.' + this.startIp.value.number4;
    const endIp = this.endIp.value.number1 + '.' + this.endIp.value.number2 + '.' + this.endIp.value.number3 + '.' + this.endIp.value.number4;
    const gateway = this.gateway.value.number1 + '.' + this.gateway.value.number2 + '.' + this.gateway.value.number3 + '.' + this.gateway.value.number4;
    const dns = this.dns.value.number1 + '.' + this.dns.value.number2 + '.' + this.dns.value.number3 + '.' + this.dns.value.number4;
    const dhcpPeerIp = this.dhcpPeerIp.value.number1 + '.' + this.dhcpPeerIp.value.number2 + '.' + this.dhcpPeerIp.value.number3 + '.' + this.dhcpPeerIp.value.number4;
    const dhcpRelayIp = this.dhcpRelayIp.value.number1 + '.' + this.dhcpRelayIp.value.number2 + '.' + this.dhcpRelayIp.value.number3 + '.' + this.dhcpRelayIp.value.number4;
    const infoPage = {
      uuid: this.selectedPort.uuid,
      state: this.state.value,
      dhcp: '',
      localIp: '',
      netmask: '',
      startIp: '',
      endIp: '',
      gateway: '',
      dns: '',
      dhcpStatus: '',
      dhcpPeerIp: '',
      dhcpRelayIp: '',
    };
    if (this.state.value === 'Enabled') {
      infoPage.dhcp = this.dhcp.value;
      infoPage.localIp = localIp;
      infoPage.netmask = netmask;
      if (this.dhcp.value === 'true') {
        infoPage.dhcpStatus = this.dhcpStatus.value;
        if (this.dhcpStatus.value === 'relay') {
          infoPage.dhcpRelayIp = dhcpRelayIp;
          infoPage.dhcpPeerIp = null;
          infoPage.startIp = null;
          infoPage.endIp = null;
          infoPage.gateway = null;
          infoPage.dns = null;
        }else {
          infoPage.startIp = startIp;
          infoPage.endIp = endIp;
          infoPage.gateway = gateway;
          infoPage.dns = dns;
          infoPage.dhcpRelayIp = null;
          if (this.dhcpStatus.value === 'none') {
            infoPage.dhcpPeerIp = null;
          }else {
            infoPage.dhcpPeerIp = dhcpPeerIp;
          }
        }
      }
    }else {
      infoPage.dhcp = this.selectedPort.dhcp;
    }

    this.done.emit(infoPage);
    this.dialogOptions.visible = false;
  }
}
