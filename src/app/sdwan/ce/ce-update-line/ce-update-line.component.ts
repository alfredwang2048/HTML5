import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TunnelInventory, TunnelService} from '../../../shared/tunnel';
import {CeService} from '../../../shared/sdwan/ce.service';
import {CeInventory} from '../../../shared/sdwan';
import {QueryObject} from '../../../base';
import {el} from '@angular/platform-browser/testing/src/browser_util';

@Component({
  selector: 'app-ce-update-line',
  templateUrl: './ce-update-line.component.html',
  styleUrls: ['./ce-update-line.component.styl']
})
export class CeUpdateLineComponent implements OnInit {

  selectedPort: any;
  @Input()
  selectedCe: CeInventory;
  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();
  updateCeTunnelForm: FormGroup;
  tunnels: Array<TunnelInventory> = null;
  endpoints: Array<any> = null;
  vlanInfos = null;
  isInvalidVlanInfo = false;
  ports: Array<any> = null;
  isQueryVlanInfo = false;
  isCanUpdate = false;
  tunnelTypes =  [{name: '犀思云专线', value: 'SYSCLOUD'}, {name: '第三方专线', value: 'THIRDPARTY'}];
  sysLocalIpData;
  dialogOptions = {
    title: '链路配置',
    width: '450px',
    height: 500,
    visible: false,
    changeHeight: 0
  };

  constructor(
    private fb: FormBuilder,
    private tunnelService: TunnelService,
    private ceService: CeService
  ) {
  }

  openDialog(data) {
    this.reset();
    this.selectedPort = data;
    this.dialogOptions.visible = true;
    this.isCanUpdate = this.selectedCe.state === 'Disabled'/* && this.selectedCe.configStatus === 'Initial'*/;
    this.resetForm();
    if (this.selectedCe.connectionType === 'TUNNEL') {
      this.getTunnels(this.selectedCe.accountUuid);
    } else {
      if (!this.selectedPort.resourceUuid) {
        this.selectedPort.resourceUuid = this.selectedCe.sdwanNetworkUuid;
      }
      this.getSdwanEndpoints();
      this.port.setValidators([Validators.required]);
      this.port.updateValueAndValidity();
    }
    this.getPorts();
  }

  reset() {
    this.vlanInfos = null;
    this.tunnels = null;
    this.endpoints = null;
    this.isQueryVlanInfo = false;
  }

  getPorts() {
    this.tunnelService.getPorts(this.selectedCe.uuid, (datas) => {
      this.ports = datas;
      if (datas.length) {
        if (this.selectedPort.portUuid) {
          this.updateCeTunnelForm.patchValue({
            port: this.selectedPort.portUuid
          });
        }else {
          this.updateCeTunnelForm.patchValue({
            port: this.ports[0].uuid
          });
        }

      }
    });
  }

  getSdwanEndpoints() {
    const infoPage = {
      uuid: this.selectedCe.sdwanNetworkUuid
    };
    const sub = this.ceService.listSdwanEndpoint(infoPage, (datas) => {
      sub.unsubscribe();
      this.endpoints = datas;
      if (datas.length) {
        this.endpoints.map(item => {
          item.name = item.name + '(' + item.interfaceName + ')';
        });
        if (this.selectedPort.endpointUuid) {
          datas.forEach((item) => {
            this.updateCeTunnelForm.patchValue({
              endpoint: this.selectedPort.endpointUuid
            });
          });
        } else {
          this.updateCeTunnelForm.patchValue({
            endpoint: this.endpoints[0].uuid
          });
        }
        this.getVlanInfo(this.selectedPort.resourceUuid, this.endpoint.value);
      }else {
        this.isQueryVlanInfo = true;
        this.vlanInfos = null;
      }
    });
  }

  getTunnels(accountUuid) {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'accountUuid', op: '=', value: accountUuid});
    qobj.addCondition({name: 'state', op: '=', value: 'Enabled'});
    const sub = this.tunnelService.query(qobj, (tunnels, total) => {
      sub.unsubscribe();
      this.tunnels = tunnels;
      if (total) {
        if (this.selectedPort.lineName === '专线') {
          this.port.setValidators([Validators.required]);
          this.port.updateValueAndValidity();
          if (this.selectedPort.resourceUuid && this.selectedPort.endpointUuid) {
            this.endpoints = this.findEndpoint(this.selectedPort.resourceUuid);
            this.updateCeTunnelForm.patchValue({
              tunnel: this.selectedPort.resourceUuid,
              endpoint: this.selectedPort.endpointUuid
            });
          } else {
            this.endpoints = this.findEndpoint(this.tunnels[0].uuid);
            this.updateCeTunnelForm.patchValue({
              tunnel: this.tunnels[0].uuid,
              endpoint: this.endpoints[0].uuid
            });
          }
          this.getVlanInfo(this.tunnel.value, this.endpoint.value);
        } else if (this.selectedPort.lineName === '公网') {
          this.port.setValidators(null);
          this.port.updateValueAndValidity();
          if (this.selectedPort.resourceUuid) {
            this.updateCeTunnelForm.patchValue({
              tunnel: this.selectedPort.resourceUuid
            });
          }else {
            this.updateCeTunnelForm.patchValue({
              tunnel: this.tunnels[0].uuid
            });
          }
          this.getTunnelEndpoints(this.tunnel.value, (datas) => {
            this.endpoints = datas;
            if (datas.length) {
              if (this.selectedPort.endpointUuid) {
                this.updateCeTunnelForm.patchValue({
                  endpoint: this.selectedPort.endpointUuid
                });
              }else {
                this.updateCeTunnelForm.patchValue({
                  endpoint: this.endpoints[0].uuid
                });
              }
              this.getVlanInfo(this.tunnel.value, this.endpoint.value);
            }else {
              this.isQueryVlanInfo = true;
            }
          });
        }
      } else {
        this.isQueryVlanInfo = true;
        this.updateCeTunnelForm.patchValue({
          tunnel: '',
          endpoint: '',
        });
      }
    });
  }

  getVlanInfo(tunnelUuid: string, endpointUuid: string) {
    const getVlanObj = {
      resourceUuid: tunnelUuid,
      endpointUuid: endpointUuid,
      connectionType: this.selectedCe.connectionType
    };
    this.isQueryVlanInfo = false;
    const sub = this.ceService.getVlanInfo(getVlanObj, (datas) => {
      this.isQueryVlanInfo = true;
      this.vlanInfos = datas;
      this.sysLocalIpData = this.selectedPort.localIp || this.vlanInfos.localIp;
      if (this.vlanInfos.vlan) {
        this.sysVlan.setValue(this.vlanInfos.vlan);
      }
      if (this.tunnelType.value && this.tunnelType.value === 'SYSCLOUD') {
        if (this.sysLocalIpData) {
          this.sysLocalIp.controls['number1'].patchValue(this.sysLocalIpData.split('.')[0]);
          this.sysLocalIp.controls['number2'].patchValue(this.sysLocalIpData.split('.')[1]);
          this.sysLocalIp.controls['number3'].patchValue(this.sysLocalIpData.split('.')[2]);
          this.sysLocalIp.controls['number4'].patchValue(this.sysLocalIpData.split('.')[3]);
          /*this.sysLocalIp.setValue({
            number1: this.sysLocalIpData.split('.')[0],
            number2: this.sysLocalIpData.split('.')[1],
            number3: this.sysLocalIpData.split('.')[2],
            number4: this.sysLocalIpData.split('.')[3]
          });*/
        }
        this.isInvalidVlanInfo = !this.vlanInfos.remoteIp;
      }
    });
  }

  changeTunnel(e) {
    this.vlanInfos = null;
    if (this.selectedPort.lineName === '专线') {
      this.endpoints = this.findEndpoint(e.target.value);
      this.updateCeTunnelForm.patchValue({
        endpoint: this.endpoints[0].uuid
      });
      this.getVlanInfo(this.tunnel.value, this.endpoint.value);
    }else {
      this.getTunnelEndpoints(e.target.value, (datas) => {
        this.endpoints = datas;
        if (datas.length) {
          this.updateCeTunnelForm.patchValue({
            endpoint: this.endpoints[0].uuid
          });
          this.getVlanInfo(this.tunnel.value, this.endpoint.value);
        }
      });
    }
  }

  changeEndpoint(e) {
    if (this.selectedCe.connectionType === 'TUNNEL') {
      this.getVlanInfo(this.tunnel.value, e.target.value);
    } else {
      this.getVlanInfo(this.selectedPort.resourceUuid, e.target.value);
    }
  }

  findEndpoint(tunnelUuid) {
    const result = [];
    if (this.tunnels) {
      this.tunnels.forEach((item) => {
        if (item.uuid === tunnelUuid) {
          item.tunnelSwitchs.forEach((it) => {
            result.push({name: it.endpointName, uuid: it.endpointUuid});
          });
        }
      });
    }
    return result;
  }

  getTunnelEndpoints(resourceUuid: string, callback: (datas) => void) {
    const sub = this.ceService.getTunnelEndpoints(resourceUuid, (datas) => {
      sub.unsubscribe();
      callback(datas);
    });
  }

  ngOnInit() {
    this.createForm();
  }

  tunnelTypeDone(e) {
    this.setValidator(e);
    if (e === 'SYSCLOUD') {
      if (this.sysLocalIpData) {
        this.sysLocalIp.controls['number1'].patchValue(this.sysLocalIpData.split('.')[0]);
        this.sysLocalIp.controls['number2'].patchValue(this.sysLocalIpData.split('.')[1]);
        this.sysLocalIp.controls['number3'].patchValue(this.sysLocalIpData.split('.')[2]);
        this.sysLocalIp.controls['number4'].patchValue(this.sysLocalIpData.split('.')[3]);
        /*this.sysLocalIp.setValue({
          number1: this.sysLocalIpData.split('.')[0],
          number2: this.sysLocalIpData.split('.')[1],
          number3: this.sysLocalIpData.split('.')[2],
          number4: this.sysLocalIpData.split('.')[3]
        });*/
      }
    }
  }

  createForm() {
    this.updateCeTunnelForm = this.fb.group({
      tunnel: [''],
      endpoint: [''],
      sysLocalIp: this.fb.group({
        number1: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number2: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number3: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number4: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      }),
      port: ['', Validators.required],
      tunnelType: [''],
      vlan: ['', [Validators.pattern(/^[1-9]\d*$/)]],
      sysVlan: ['', [Validators.pattern(/^[1-9]\d*$/)]],
      localIp: this.fb.group({
        number1: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number2: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number3: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number4: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      }),
      peerIp: this.fb.group({
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
      asn: ['', [Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      password: [''],
      remoteIp: this.fb.group({
        number1: ['', [Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number2: ['', [Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number3: ['', [Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
        number4: ['', [Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      })
    });
  }

  resetForm() {
    this.updateCeTunnelForm.reset({
      tunnel: '',
      endpoint: '',
      sysLocalIp: {
        number1: '',
        number2: '',
        number3: '',
        number4: ''
      },
      port: '',
      tunnelType: this.selectedPort.tunnelType ? this.tunnelTypes.filter(item => item.value === this.selectedPort.tunnelType)[0].value : this.tunnelTypes[0].value,
      vlan: this.selectedPort.vlan,
      sysVlan: '',
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
      peerIp: this.selectedPort.peIp ? {
        number1: this.selectedPort.peIp.split('.')[0],
        number2: this.selectedPort.peIp.split('.')[1],
        number3: this.selectedPort.peIp.split('.')[2],
        number4: this.selectedPort.peIp.split('.')[3]
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
      asn: this.selectedPort.asn,
      password: this.selectedPort.password,
      remoteIp: this.selectedPort.monitorIp ? {
        number1: this.selectedPort.monitorIp.split('.')[0],
        number2: this.selectedPort.monitorIp.split('.')[1],
        number3: this.selectedPort.monitorIp.split('.')[2],
        number4: this.selectedPort.monitorIp.split('.')[3]
      } : {
        number1: '',
        number2: '',
        number3: '',
        number4: ''
      }
    });
    this.setValidator(this.selectedPort.tunnelType || 'SYSCLOUD');
  }

  setValidator(type) {
    if (type === 'SYSCLOUD') {
      if (this.selectedCe.connectionType === 'TUNNEL') {
        this.tunnel.setValidators(Validators.required);
        this.tunnel.updateValueAndValidity();
      }
      this.vlan.setValidators(null);
      this.vlan.updateValueAndValidity();
      this.sysVlan.setValidators([Validators.pattern(/^[1-9]\d*$/)]);
      this.sysVlan.updateValueAndValidity();

      for (let i = 1; i <= 4; i++) {
        const name = String('number' + i);
        this.sysLocalIp.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
        this.sysLocalIp.get(name).updateValueAndValidity();
        if (i !== 4) {this.sysLocalIp.get(name).disable({}); }
        this.localIp.get(name).setValidators(null);
        this.localIp.get(name).updateValueAndValidity();
        this.peerIp.get(name).setValidators(null);
        this.peerIp.get(name).updateValueAndValidity();
        this.netmask.get(name).setValidators(null);
        this.netmask.get(name).updateValueAndValidity();
      }

      this.asn.setValidators(null);
      this.asn.updateValueAndValidity();
      if (this.vlanInfos) {
        this.isInvalidVlanInfo = !this.vlanInfos.remoteIp;
      }
    }else {
      this.tunnel.setValidators(null);
      this.tunnel.updateValueAndValidity();
      this.vlan.setValidators([Validators.pattern(/^[1-9]\d*$/)]);
      this.vlan.updateValueAndValidity();
      this.sysVlan.setValidators(null);
      this.sysVlan.updateValueAndValidity();

      for (let i = 1; i <= 4; i++) {
        const name = String('number' + i);
        this.sysLocalIp.get(name).setValidators(null);
        this.sysLocalIp.get(name).updateValueAndValidity();
        this.localIp.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
        this.localIp.get(name).updateValueAndValidity();
        this.peerIp.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
        this.peerIp.get(name).updateValueAndValidity();
        this.netmask.get(name).setValidators([Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
        this.netmask.get(name).updateValueAndValidity();
      }

      this.asn.setValidators([Validators.pattern('^([0-9]|[1-9]\\d+)$')]);
      this.asn.updateValueAndValidity();
      this.isInvalidVlanInfo = false;
    }
  }

  get tunnel() {
    return this.updateCeTunnelForm.get('tunnel');
  }

  get endpoint() {
    return this.updateCeTunnelForm.get('endpoint');
  }

  get sysLocalIp(): FormArray {
    return this.updateCeTunnelForm.get('sysLocalIp') as FormArray;
  }

  get port() {
    return this.updateCeTunnelForm.get('port');
  }

  get tunnelType() {
    return this.updateCeTunnelForm.get('tunnelType');
  }

  get vlan() {
    return this.updateCeTunnelForm.get('vlan');
  }

  get sysVlan() {
    return this.updateCeTunnelForm.get('sysVlan');
  }

  get localIp() {
    return this.updateCeTunnelForm.get('localIp');
  }

  get peerIp() {
    return this.updateCeTunnelForm.get('peerIp');
  }

  get netmask() {
    return this.updateCeTunnelForm.get('netmask');
  }

  get asn() {
    return this.updateCeTunnelForm.get('asn');
  }

  get password() {
    return this.updateCeTunnelForm.get('password');
  }

  get remoteIp() {
    return this.updateCeTunnelForm.get('remoteIp');
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const localIp = this.localIp.value.number1 + '.' + this.localIp.value.number2 + '.' + this.localIp.value.number3 + '.' + this.localIp.value.number4;
    const peerIp = this.peerIp.value.number1 + '.' + this.peerIp.value.number2 + '.' + this.peerIp.value.number3 + '.' + this.peerIp.value.number4;
    const netmask = this.netmask.value.number1 + '.' + this.netmask.value.number2 + '.' + this.netmask.value.number3 + '.' + this.netmask.value.number4;
    const sysLocalIp = this.sysLocalIp.controls['number1'].value + '.' + this.sysLocalIp.controls['number2'].value + '.' + this.sysLocalIp.controls['number3'].value + '.' + this.sysLocalIp.controls['number4'].value;
    let remoteIp  = '';
    if (this.remoteIp.value.number1 && this.remoteIp.value.number2 && this.remoteIp.value.number3 && this.remoteIp.value.number4) {
      remoteIp = this.remoteIp.value.number1 + '.' + this.remoteIp.value.number2 + '.' + this.remoteIp.value.number3 + '.' + this.remoteIp.value.number4;
    }
    const infoPage = {
      uuid: this.selectedPort.uuid,
      resourceUuid: this.tunnelType.value === 'SYSCLOUD' ? this.tunnel.value : '',
      endpointUuid: this.tunnelType.value === 'SYSCLOUD' ? this.endpoint.value : '',
      remoteIp: this.tunnelType.value === 'SYSCLOUD' ? this.vlanInfos.remoteIp : remoteIp,
      localIp: this.tunnelType.value === 'SYSCLOUD' ? sysLocalIp : localIp,
      peerIp: this.tunnelType.value === 'SYSCLOUD' ? '' : peerIp,
      netmask: this.tunnelType.value === 'SYSCLOUD' ? this.vlanInfos.netmask : netmask,
      vlan: this.tunnelType.value === 'SYSCLOUD' ? this.sysVlan.value : this.vlan.value,
      portUuid: this.port.value,
      switchPortUuid: '',
      asn: this.tunnelType.value === 'SYSCLOUD' ? '' : this.asn.value,
      password: this.tunnelType.value === 'SYSCLOUD' ? '' : this.password.value,
      tunnelType: this.selectedPort.lineType === 'TUNNEL' ? this.tunnelType.value : '',
    };
    if (this.selectedCe.connectionType === 'SDWAN') {
      infoPage.resourceUuid = this.selectedPort.resourceUuid;
    } else {
      if (this.selectedPort.lineType === 'TUNNEL') {
        infoPage.switchPortUuid = null;
      } else {
        infoPage.switchPortUuid = this.vlanInfos.switchPortUuid;
        infoPage.portUuid = null;
      }
    }
    this.done.emit(infoPage);
    this.dialogOptions.visible = false;
  }

}

