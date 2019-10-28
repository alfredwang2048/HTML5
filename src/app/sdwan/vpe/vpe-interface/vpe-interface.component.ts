import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {VpeInventory, VpeService} from '../../../shared/sdwan';
import {PageSize} from '../../../model';
import {QueryObject} from '../../../base';
import {CommonWindowComponent} from '../../../m-common/common-window/common-window.component';

@Component({
  selector: 'app-vpe-interface',
  templateUrl: './vpe-interface.component.html',
  styleUrls: ['./vpe-interface.component.styl']
})
export class VpeInterfaceComponent implements OnInit {

  @Input()
  selectedItem: VpeInventory;
  @Output()
  done: EventEmitter<VpeInventory> = new EventEmitter();

  dialogOptions = {
    title: '接口管理',
    width: '700px',
    visible: false,
  };
  interfaceLists: Array<any> = [];
  selectedItems_interface: any;
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

  ngOnInit() {
  }

  open() {
    this.reset();
    this.dialogOptions.visible = true;
  }

  reset() {
    this.queryVpeInterface();
  }

  createDone() {
    this.queryVpeInterface();
  }

  openDeleteWin(detail) {
    this.selectedItems_interface = detail;
    this.deleteCommonOption.message = `请确认是否删除接口：<span class="red">${this.selectedItems_interface.endpointUuid}</span>`;
    this.deleteEleRf.open();
  }

  deleteDone() {
    this.vpeService.deleteVpeInterface(this.selectedItems_interface, datas => {
      this.queryVpeInterface();
    });
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

}
