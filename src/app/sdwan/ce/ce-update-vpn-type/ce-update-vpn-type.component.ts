import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {CeService} from '../../../shared/sdwan/ce.service';

@Component({
  selector: 'app-ce-update-vpn-type',
  templateUrl: './ce-update-vpn-type.component.html',
  styleUrls: ['./ce-update-vpn-type.component.styl']
})
export class CeUpdateVpnTypeComponent implements OnInit {

  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  ceInfos: any;
  vpnModels = [{name: 'OPENVPN', value: 'OPENVPN'}, {name: 'SVPN', value: 'SVPN'}];
  vpnModel = this.vpnModels[0];
  dialogOptions = {
    title: '修改vpn模式',
    width: '400px',
    visible: false,
    changeHeight: 0
  };
  isCanUpdate: boolean;
  constructor(
    private ceService: CeService
  ) { }

  ngOnInit() {
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.vpnModel = this.vpnModels.filter(item => {
      return item.value === this.ceInfos.ceInventory.vpnType;
    })[0];
    this.isCanUpdate = this.ceInfos.ceInventory.state === 'Disabled' && this.ceInfos.ceInventory.configStatus === 'Initial';
  }

  selectVpn(item) {
    this.vpnModel = item;
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const ce = new CeInventory();
    ce.uuid = this.ceInfos.ceInventory.uuid;
    ce.vpnType = this.vpnModel.value;
    /*this.ceService.updateVpnType(ce, (data) => {
      this.done.emit( data);
    });*/
    this.done.emit(ce);
    this.dialogOptions.visible = false;
  }
}
