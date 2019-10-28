import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import {CeInventory, SdwanService} from '../../../shared/sdwan';
import {QueryObject} from '../../../base';

@Component({
  selector: 'app-ce-switch-sdwan-network',
  templateUrl: './ce-switch-sdwan-network.html',
  styleUrls: ['./ce-switch-sdwan-network.styl']
})
export class CeSwitchSdwanNetworkComponent implements OnInit {
  @Output()
  done: EventEmitter<any> = new EventEmitter();
  @Input()
  selectedCe: CeInventory;
  isUpdate: boolean;
  networks;
  model = {
    ceUuid: '',
    sdwanNetworkUuid: ''
  };

  dialogOptions = {
    title: '变更SD-WAN网络',
    width: '450px',
    visible: false,
    changeHeight: 0
  };

  constructor(
    private networkService: SdwanService
  ) { }

  ngOnInit() {
  }

  openDialog() {
    this.dialogOptions.visible = true;
    setTimeout(() => {
      this.isUpdate = this.selectedCe.state === 'Disabled' && this.selectedCe.configStatus === 'Initial';
      this.getSdwanNetwork();
    });
  }

  getSdwanNetwork() {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'accountUuid', op: '=', value: this.selectedCe.accountUuid});
    this.networkService.query(qobj, datas => {
      this.networks = datas;
      this.model.sdwanNetworkUuid = this.selectedCe.sdwanNetworkUuid || datas[0].uuid;
    }, false);
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    this.model.ceUuid = this.selectedCe.uuid;
    this.done.emit(this.model);
    this.dialogOptions.visible = false;
  }

}
