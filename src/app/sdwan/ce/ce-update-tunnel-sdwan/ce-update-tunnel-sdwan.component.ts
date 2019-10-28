import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CeInventory} from '../../../shared/sdwan';
import {CeService} from '../../../shared/sdwan/ce.service';

@Component({
  selector: 'app-ce-update-tunnel-sdwan',
  templateUrl: './ce-update-tunnel-sdwan.component.html',
  styleUrls: ['./ce-update-tunnel-sdwan.component.styl']
})
export class CeUpdateTunnelSdwanComponent implements OnInit, OnChanges {

  @Input()
  selectedPort: any;
  @Input()
  selectedCe: CeInventory;
  @Output()
  done: EventEmitter<any>  = new EventEmitter<any>();

  updateCeTunnelSdwanForm: FormGroup;
  isOpenPortList = [{name: '启用', value: 'Enabled'}, {name: '禁用', value: 'Disabled'}];
  endpoints: Array<any> = null;
  vlanInfos = null;

  dialogOptions = {
    title: '专线配置',
    width: '430px',
    visible: false,
    changeHeight: 0
  };

  constructor(
    private fb: FormBuilder,
    private ceService: CeService
  ) { }

  openDialog() {
    this.dialogOptions.visible = true;
    this.vlanInfos = null;
    this.getEndpoints();
  }

  getEndpoints() {
    const infoPage = {
      uuid: this.selectedCe.sdwanNetworkUuid
    };
    const sub = this.ceService.listSdwanEndpoint(infoPage, (datas) => {
      sub.unsubscribe();
      const currentEndpoint = this.selectedCe.popInfos.filter((i) => {
        return i.portUuid === this.selectedPort.uuid;
      })[0];
      if (datas.length !== 0 ) {
        this.endpoints = datas;
        if (currentEndpoint) {
          this.updateCeTunnelSdwanForm.patchValue({
            endpoint: currentEndpoint.endpointUuid
          });
          this.getVlanInfo(this.selectedCe.sdwanNetworkUuid, currentEndpoint.endpointUuid);
        }else {
          this.updateCeTunnelSdwanForm.patchValue({
            endpoint: this.endpoints[0].uuid
          });
          this.getVlanInfo(this.selectedCe.sdwanNetworkUuid, this.endpoints[0].uuid);
        }
      }else {
        this.endpoints = null;
        this.updateCeTunnelSdwanForm.patchValue({
          endpoint: ''
        });
      }
    });
  }

  changeEndpoint(e) {
    this.getVlanInfo(this.selectedCe.sdwanNetworkUuid, e.target.value);
  }

  getVlanInfo(sdwanUuid: string, endpointUuid: string) {
    const getVlanObj = {
      resourceUuid: sdwanUuid,
      endpointUuid: endpointUuid,
      connectionType: this.selectedCe.connectionType
    };
    const sub = this.ceService.getVlanInfo(getVlanObj, (datas) => {
      this.vlanInfos = datas;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedPort && this.updateCeTunnelSdwanForm) {
      this.updateCeTunnelSdwanForm.get('isOpenPort').patchValue(this.selectedPort.state);
    }
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.updateCeTunnelSdwanForm = this.fb.group({
      isOpenPort: [''],
      endpoint: ['', Validators.required],
    });
  }

  get isOpenPort() {
    return this.updateCeTunnelSdwanForm.get('isOpenPort');
  }

  get endpoint() {
    return this.updateCeTunnelSdwanForm.get('endpoint');
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const infoPage = {
      uuid: this.selectedPort.uuid,
      resourceUuid: this.selectedCe.sdwanNetworkUuid,
      endpointUuid: this.endpoint.value,
      localIp: this.vlanInfos.localIp,
      netmask: this.vlanInfos.netmask,
      remoteIp: this.vlanInfos.remoteIp,
      vlan: this.vlanInfos.vlan
    };

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
