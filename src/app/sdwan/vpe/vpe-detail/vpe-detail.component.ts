import {Component, Input, OnInit} from '@angular/core';
import {VpeInventory, VpeService} from '../../../shared/sdwan';
import {QueryObject} from '../../../base';
import {sizeRoundToString} from '../../../model/monitor';

@Component({
  selector: 'app-vpe-detail',
  templateUrl: './vpe-detail.component.html',
  styleUrls: ['./vpe-detail.component.styl']
})
export class VpeDetailComponent implements OnInit {

  @Input()
  selectedItem: VpeInventory;
  modelOption = {
    width: '500px',
    title: 'VPE详情',
    toggle: false
  };

  interfaceLists: Array<any> = [];
  networkLists: Array<any> = [];
  CeNumOnVpe = {
    masterCeNum: 0,
    slaveCeNum: 0,
    usedBandwidth: '0'
  };

  constructor(private vpeService: VpeService) {
  }

  queryCeNumOnVpe() {
    this.vpeService.getCeNumOnVpe(this.selectedItem, (list) => {
      if (list.success) {
        this.CeNumOnVpe = {
          masterCeNum: list.masterCeNum,
          slaveCeNum: list.slaveCeNum,
          usedBandwidth: sizeRoundToString(parseInt(list.usedBandwidth,10))
        };
      } else {
        this.CeNumOnVpe = {
          masterCeNum: 0,
          slaveCeNum: 0,
          usedBandwidth: '0'
        };
      }
    });
  }

  queryVpeInterface() {
    const qobj = new QueryObject();
    qobj.sortBy = 'number';
    qobj.sortDirection = 'asc';
    qobj.addCondition({name: 'vpeUuid', op: '=', value: this.selectedItem.uuid});
    const sub = this.vpeService.queryVpeInterface(qobj, (datas, total) => {
      sub.unsubscribe();
      if (total > 0) {
        this.interfaceLists = datas;
      } else {
        this.interfaceLists = [];
      }
    });
  }

  queryVpeIpInfo() {
    const qobj = new QueryObject();
    qobj.sortBy = 'number';
    qobj.sortDirection = 'asc';
    qobj.addCondition({name: 'vpeUuid', op: '=', value: this.selectedItem.uuid});
    const sub = this.vpeService.queryVpeIpInfo(qobj, (datas, total) => {
      sub.unsubscribe();
      if (total > 0) {
        this.networkLists = datas;
      } else {
        this.networkLists = [];
      }
    });
  }
  ngOnInit() {
  }

  open() {
    this.queryVpeInterface();
    this.queryVpeIpInfo();
    this.queryCeNumOnVpe();
    this.modelOption.toggle = true;
  }

}
