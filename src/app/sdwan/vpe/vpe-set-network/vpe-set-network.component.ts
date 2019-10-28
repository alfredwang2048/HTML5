import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {VpeInventory, VpeService} from '../../../shared/sdwan';
import {PageSize} from '../../../model';
import {CommonWindowComponent} from '../../../m-common/common-window/common-window.component';
import {QueryObject} from '../../../base';
import {PublicNetworkType} from '../vpe.component';

@Component({
  selector: 'app-vpe-set-network',
  templateUrl: './vpe-set-network.component.html',
  styleUrls: ['./vpe-set-network.component.styl']
})
export class VpeSetNetworkComponent implements OnInit {

  @Input()
  selectedItem: VpeInventory;
  @Output()
  done: EventEmitter<VpeInventory> = new EventEmitter();

  dialogOptions = {
    title: '配置网络',
    width: '700px',
    visible: false,
  };
  networkLists: Array<any> = [];
  selectedItems_network: any;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0
  };

  @ViewChild('delete')
  deleteEleRf: CommonWindowComponent;
  deleteCommonOption = {
    width: '450px',
    title: '删除',
    message: ''
  };

  constructor(private vpeService: VpeService) {
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
    this.reset();
    this.dialogOptions.visible = true;
  }

  reset() {
    this.queryVpeIpInfo();
  }

  createDone() {
    this.queryVpeIpInfo();
  }

  openDeleteWin(detail) {
    this.selectedItems_network = detail;

    PublicNetworkType.forEach((item) => {
      if (item.value === detail.type) {
        this.selectedItems_network.typeName = item.name;
      }
    });
    this.deleteCommonOption.message = `请确认是否删除网络：<span class="red">${this.selectedItems_network.typeName}</span>`;
    this.deleteEleRf.open();
  }

  deleteDone() {
    this.vpeService.deleteVpeIpInfo(this.selectedItems_network, datas => {
      this.queryVpeIpInfo();
    });
  }

  cancel() {
    this.dialogOptions.visible = false;
  }
}
