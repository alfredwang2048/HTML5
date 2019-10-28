import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CeInventory} from '../../../shared/sdwan';
import {TunnelInventory, TunnelService} from '../../../shared/tunnel';
import {QueryObject} from '../../../base';
import {CeService} from '../../../shared/sdwan/ce.service';

@Component({
  selector: 'app-ce-update-tunnel',
  templateUrl: './ce-update-tunnel.component.html',
  styleUrls: ['./ce-update-tunnel.component.styl']
})
export class CeUpdateTunnelComponent implements OnInit, OnChanges {

  @Input()
  selectedPort: any;
  @Input()
  selectedCe: CeInventory;
  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();

  updateCeTunnelForm: FormGroup;
  isOpenPortList = [/*{name: '启用', value: 'Enabled'}, */{name: '禁用', value: 'Disabled'}];
  tunnels: Array<TunnelInventory> = null;
  endpoints: Array<any> = null;
  vlanInfos = null;
  dialogOptions = {
    title: '专线配置',
    width: '500px',
    visible: false,
    changeHeight: 0
  };

  constructor(
    private fb: FormBuilder,
    private tunnelService: TunnelService,
    private ceService: CeService
  ) { }

  openDialog() {
    this.dialogOptions.visible = true;
    this.getTunnels(this.selectedCe.accountUuid);
  }

  getTunnels(accountUuid) {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'accountUuid', op: '=', value: accountUuid});
    qobj.addCondition({name: 'state', op: '=', value: 'Enabled'});
    const sub = this.tunnelService.query(qobj, (tunnels, total) => {
      sub.unsubscribe();
      this.tunnels = tunnels;
      const currentInfo = this.selectedCe.popInfos.filter((i) => {
        return i.portUuid === this.selectedPort.uuid;
      })[0];
      if (total) {
        if (currentInfo) {
          this.endpoints = this.findEndpoint(currentInfo.resourceUuid);
          this.updateCeTunnelForm.patchValue({
            tunnel: currentInfo.resourceUuid,
            endpoint: currentInfo.endpointUuid,
            haType: currentInfo.haType
          });
        }else {
          this.endpoints = this.findEndpoint(this.tunnels[0].uuid);
          this.updateCeTunnelForm.patchValue({
            tunnel: this.tunnels[0].uuid,
            endpoint: this.endpoints[0].uuid,
            haType: 'Slave'
          });
        }
        this.getVlanInfo(this.tunnel.value, this.endpoint.value);
      }else {
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
    const sub = this.ceService.getVlanInfo(getVlanObj, (datas) => {
      this.vlanInfos = datas;
      if (this.vlanInfos.localIp) {
        this.updateCeTunnelForm.patchValue({
          ip: this.vlanInfos.localIp.split('.')[3]
        });
        this.ip.setValidators([Validators.required, Validators.pattern(/^[1-9]\d*$/)]);
        this.ip.updateValueAndValidity();
      }else {
        this.ip.setValidators(null);
        this.ip.updateValueAndValidity();
      }
    });
  }

  changeTunnel(e) {
    this.endpoints = this.findEndpoint(e.target.value);
    this.updateCeTunnelForm.patchValue({
      endpoint: this.endpoints[0].uuid
    });
    this.getVlanInfo(this.tunnel.value, this.endpoint.value);
  }

  changeEndpoint(e) {
    this.getVlanInfo(this.tunnel.value, e.target.value);
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedPort && this.updateCeTunnelForm) {
      this.updateCeTunnelForm.get('isOpenPort').patchValue(/*this.selectedPort.state*/'Disabled');
    }
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.updateCeTunnelForm = this.fb.group({
      isOpenPort: [''],
      tunnel: ['', Validators.required],
      endpoint: ['', Validators.required],
      haType: [''],
      ip: ['', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]]
    });
  }

  get isOpenPort() {
    return this.updateCeTunnelForm.get('isOpenPort');
  }

  get tunnel() {
    return this.updateCeTunnelForm.get('tunnel');
  }

  get endpoint() {
    return this.updateCeTunnelForm.get('endpoint');
  }

  get haType() {
    return this.updateCeTunnelForm.get('haType');
  }

  get ip() {
    return this.updateCeTunnelForm.get('ip');
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const infoPage = {
      uuid: this.selectedPort.uuid,
      resourceUuid: this.tunnel.value,
      endpointUuid: this.endpoint.value,
      haType: this.haType.value,
      remoteIp: this.vlanInfos.remoteIp,
      vlan: this.vlanInfos.vlan,
      netmask: this.vlanInfos.netmask,
      localIp: null
    };
    if (this.vlanInfos.localIp) {
      const arr = this.vlanInfos.localIp.split('.');
      infoPage.localIp = arr[0] + '.' + arr[1] + '.' + arr[2] + '.' + this.ip.value;
    }

    if (this.isOpenPort.value === 'Enabled') {
      /*this.ceService.enableTunnelPort(infoPage, (data) => {
        this.done.emit(data);
      });*/
      this.done.emit({type: 'Enabled', params: infoPage});
    }else {
      /*this.ceService.disablePort(infoPage, (data) => {
        this.done.emit(data);
      });*/
      this.done.emit({type: 'Disabled', params: infoPage});
    }

    this.dialogOptions.visible = false;
  }

}
