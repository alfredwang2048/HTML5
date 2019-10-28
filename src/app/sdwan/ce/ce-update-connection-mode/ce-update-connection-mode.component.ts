import {AfterContentChecked, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeService} from '../../../shared/sdwan/ce.service';
import {QueryObject} from '../../../base';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SdwanInventory, SdwanService} from '../../../shared/sdwan';
import {ConnectionMode} from '../../../model/utils';

@Component({
  selector: 'app-ce-update-connection-mode',
  templateUrl: './ce-update-connection-mode.component.html',
  styleUrls: ['./ce-update-connection-mode.component.styl']
})
export class CeUpdateConnectionModeComponent implements OnInit, AfterContentChecked {

  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  ceInfos: any;

  allBandwidth: Array<any>;
  selectedBandwith: any;
  connectionTypes = [{name: '专线连接', value: 'TUNNEL'}, {name: 'SD-WAN连接', value: 'SDWAN'}];
  masterSlaveSwitchs = [{name: '手动切换', value: 'Manual'}, {name: '自动切换', value: 'AUTO'}];
  l3Protocols = [{name: 'BGP', value: 'BGP'}, {name: 'NAT', value: 'NAT'}];
  connectionModes: Array<any>;
  sdwanNetworks: Array<SdwanInventory>;
  updateConnectionModeForm: FormGroup;
  isCanUpdate = false;
  dialogOptions = {
    title: '设置链路模式',
    width: '580px',
    visible: false,
    changeHeight: 0
  };
  UtilsconnectionMode = ConnectionMode;
  showbandwidthTips = false;
  constructor(
    private ceService: CeService,
    private fb: FormBuilder,
    private sdwanService: SdwanService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  ngAfterContentChecked() {
    this.dialogOptions.changeHeight++;
  }

  createForm() {
    this.updateConnectionModeForm = this.fb.group({
      connectionType: ['', Validators.required],
      connectionMode: ['', Validators.required],
      l3Protocol: ['', Validators.required],
      masterSlaveSwitch: ['', Validators.required],
      sdwanNetworkUuid: [''],
    });
  }

  resetForm() {
    this.updateConnectionModeForm.reset({
      connectionType: this.ceInfos.ceInventory.connectionType,
      connectionMode: this.ceInfos.ceInventory.connectionMode,
      l3Protocol: this.ceInfos.ceInventory.l3Protocol,
      masterSlaveSwitch: this.ceInfos.ceInventory.masterSlaveSwitch,
    });
  }

  getSdwanNetwork(accountUuid) {
    this.sdwanNetworks = null;
    this.updateConnectionModeForm.patchValue({sdwanNetworkUuid: ''});
    const qobj = new QueryObject();
    qobj.addCondition({name: 'accountUuid', op: '=', value: accountUuid});
    if (this.connectionMode.value !== 'DOUBLE_INTERNET') {
      qobj.addCondition({name: 'l3networkType', op: '=', value: 'ASSIGN'});
    }
    this.sdwanService.query(qobj, (datas, total) => {
      this.sdwanNetworks = datas;
      if (total) {
        if (this.connectionType.value === 'SDWAN') {
          this.updateConnectionModeForm.patchValue({
            sdwanNetworkUuid: this.sdwanNetworks.filter(item => item.uuid === this.ceInfos.ceInventory.sdwanNetworkUuid).length ? this.ceInfos.ceInventory.sdwanNetworkUuid : this.sdwanNetworks[0].uuid
          });
        }
      }
    }, false);
  }

  changeConnectionMode() {
    if (this.connectionType.value === 'SDWAN' && this.ceInfos.ceInventory.accountUuid) {this.getSdwanNetwork(this.ceInfos.ceInventory.accountUuid); }
  }

  changeConnectionType() {
    if (this.connectionType.value === 'TUNNEL') {
      this.sdwanNetworks = null;
      this.updateConnectionModeForm.patchValue({sdwanNetworkUuid: ''});
      this.sdwanNetworkUuid.setValidators(null);
      this.sdwanNetworkUuid.updateValueAndValidity();
    }else {
      this.sdwanNetworkUuid.setValidators([Validators.required]);
      this.sdwanNetworkUuid.updateValueAndValidity();
      if (!this.sdwanNetworks) {this.getSdwanNetwork(this.ceInfos.ceInventory.accountUuid); }
    }
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.resetForm();
    this.sdwanNetworks = null;
    this.showbandwidthTips = false;
    this.getAllBandwidth();
    this.listConnectionMode(this.ceInfos.ceInventory.model);
    if (this.ceInfos.ceInventory.connectionType === 'SDWAN') {
      this.getSdwanNetwork(this.ceInfos.ceInventory.accountUuid);
    }
    this.isCanUpdate = this.ceInfos.ceInventory.state === 'Disabled' && this.ceInfos.ceInventory.configStatus === 'Initial';
  }


  getAllBandwidth() {
    const qobj = new QueryObject();
    qobj.sortBy = 'bandwidth';
    qobj.sortDirection = 'asc';
    qobj.conditions = [];
    const sub = this.ceService.queryBandwidth(qobj, (datas: any) => {
      sub.unsubscribe();
      this.allBandwidth = datas;
    });
  }

  listConnectionMode(model) {
    const sub = this.ceService.listConnection(model, (datas) => {
      sub.unsubscribe();
      this.connectionModes = datas;
      if (datas.length) {
        this.updateConnectionModeForm.patchValue({
          connectionMode: this.ceInfos.ceInventory.connectionMode ? this.ceInfos.ceInventory.connectionMode : this.connectionModes[0]
        });
      }
    });
  }

  get connectionType() {
    return this.updateConnectionModeForm.get('connectionType');
  }

  get connectionMode() {
    return this.updateConnectionModeForm.get('connectionMode');
  }

  get sdwanNetworkUuid() {
    return this.updateConnectionModeForm.get('sdwanNetworkUuid');
  }

  get masterSlaveSwitch() {
    return this.updateConnectionModeForm.get('masterSlaveSwitch');
  }

  get l3Protocol() {
    return this.updateConnectionModeForm.get('l3Protocol');
  }

  selectBandwidthDone(e) {
    this.selectedBandwith = e;
    this.showbandwidthTips = false;
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const infoPage = {
      uuid: this.ceInfos.ceInventory.uuid,
      bandwidthOfferingUuid: null,
      connectionType: this.connectionType.value,
      connectionMode: this.connectionMode.value,
      l3Protocol: this.l3Protocol.value,
      masterSlaveSwitch: this.masterSlaveSwitch.value,
      sdwanNetworkUuid: this.sdwanNetworkUuid.value,
    };
    if (this.connectionType.value === 'SDWAN') {
      infoPage.sdwanNetworkUuid = this.sdwanNetworkUuid.value;
      infoPage.l3Protocol = this.l3Protocol.value;
    }else {
      infoPage.sdwanNetworkUuid = null;
      infoPage.l3Protocol = null;
    }
    if (this.connectionMode.value !== 'DOUBLE_TUNNEL') {
      if (this.selectedBandwith || this.ceInfos.ceInventory.bandwidthOfferingUuid) {
        this.showbandwidthTips = false;
        infoPage.bandwidthOfferingUuid = this.selectedBandwith ? this.selectedBandwith.uuid : this.ceInfos.ceInventory.bandwidthOfferingUuid;
      }else {
        this.showbandwidthTips = true;
      }
    }else {
      infoPage.bandwidthOfferingUuid = null;
      this.showbandwidthTips = false;
    }

    if (!this.showbandwidthTips) {
      this.done.emit(infoPage);
      this.dialogOptions.visible = false;
    }
  }

}
