import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {CeService} from '../../../shared/sdwan/ce.service';
import {QueryObject} from '../../../base';

@Component({
  selector: 'app-ce-update-bandwidth',
  templateUrl: './ce-update-bandwidth.component.html',
  styleUrls: ['./ce-update-bandwidth.component.styl']
})
export class CeUpdateBandwidthComponent implements OnInit {

  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  ceInfos: any;

  allBandwidth: Array<any>;
  selectedBandwith: any;
  currentBandwidth: any;
  modifyNum: any;
  isTipsShow = false;
  dialogOptions = {
    title: '变更带宽',
    width: '580px',
    visible: false,
    changeHeight: 0
  };
  constructor(
    private ceService: CeService
  ) { }

  ngOnInit() {
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.isTipsShow = false;
    this.getAllBandwidth();
    this.getModifyNum();
  }

  getModifyNum() {
    this.ceService.getModifyNum(this.ceInfos.ceInventory.uuid, (data) => {
      this.modifyNum = data;
    });
  }

  getAllBandwidth() {
    const qobj = new QueryObject();
    qobj.sortBy = 'bandwidth';
    qobj.sortDirection = 'asc';
    qobj.conditions = [];
    const sub = this.ceService.queryBandwidth(qobj, (datas: any) => {
      sub.unsubscribe();
      this.currentBandwidth = this.ceInfos.ceInventory.bandwidthOfferingUuid;
      this.allBandwidth = datas;
    });
  }

  selectBandwidthDone(e) {
    this.selectedBandwith = e;
  }

  cancel() {
    this.dialogOptions.visible = false;
    this.currentBandwidth = null;
  }

  confirm() {
    const infoPage = {
      uuid: this.ceInfos.ceInventory.uuid,
      bandwidthOfferingUuid: null
    };
    if (this.selectedBandwith) {
      infoPage.bandwidthOfferingUuid = this.selectedBandwith.uuid;
    }else {
      infoPage.bandwidthOfferingUuid = this.ceInfos.ceInventory.bandwidthOfferingUuid;
    }
    if (this.modifyNum.leftModifies > 0 ) {
      this.done.emit(infoPage);
      this.dialogOptions.visible = false;
    }else {
      this.isTipsShow = true;
    }
  }

}
