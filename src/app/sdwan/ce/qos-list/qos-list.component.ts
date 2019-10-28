import {AfterContentChecked, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {PageSize} from '../../../model';
import {QueryObject} from '../../../base';
import {CeService} from '../../../shared/sdwan/ce.service';

@Component({
  selector: 'app-qos-list',
  templateUrl: './qos-list.component.html',
  styleUrls: ['./qos-list.component.styl']
})
export class QosListComponent implements OnInit, AfterContentChecked {
  @Input()
    selectedItem: any;
  @Input()
    resourceQuotaNumber: number;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();
  @Input()
    isModel = false;
  dialogOptions = {
    title: 'QoS规则',
    width: '800px',
    visible: false,
    changeHeight: 0
  };
  qoss: Array<any> = [];
  gridLoading = true;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  selectedQoss: Array<string> = [];
  input_box = false;
  constructor(
    private ceService: CeService
  ) { }

  ngOnInit() {
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.selectedQoss = [];
    this.input_box = false;
    setTimeout(() => {
      this.search();
    });
  }

  reset() {
    this.selectedQoss = [];
    this.input_box = false;
  }

  ngAfterContentChecked() {
    this.dialogOptions.changeHeight ++;
  }

  createQosDone(params) {
    this.done.emit({type: 'add', data: params});
  }

  clickId() {
    this.selectedQoss = this.qoss.filter(item => item.status).map(it => it.uuid);
  }

  selectAll(value) {
    if (value) {
      this.qoss.map(item => {
        item.status = true;
      });
    }else {
      this.qoss.map(item => {
        item.status = false;
      });
    }
    this.clickId();
  }

  selectItem(e) {
    e.rowData.status = true;
    this.clickId();
  }

  deleteQos() {
    const infoPage = {
      uuids: this.selectedQoss,
      sdwanNetworkUuid: this.selectedItem.uuid,
      ceUuid: this.selectedItem.uuid
    };
    this.done.emit({type: 'delete', data: infoPage});
  }

  search(isCreate = false) {
    this.qoss = [];
    if (isCreate) {this.pagination.current = 1; }
    const qobj = new QueryObject();
    qobj.start = isCreate ? 0 : (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    qobj.sortBy = this.isModel ? 'createDate' : 'number';
    qobj.sortDirection = 'desc';
    qobj.addCondition({name: this.isModel ? 'sdwanNetworkUuid' : 'ceUuid', op: '=', value: this.selectedItem.uuid});
    this.gridLoading = true;
    const sub = this.ceService.queryQos(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.qoss = datas;
      if (total) {
        this.qoss.map(item => {
          item.status = false;
        });
      }
      this.pagination.total = total;
      this.pagination.show = total !== 0;
      this.dialogOptions.changeHeight ++;
    }, this.isModel);
  }

  pageChange(size: number, isSize: boolean) {
    if (isSize) {
      this.pagination.current = 1;
      this.pagination.size = size;
    } else {
      this.pagination.current = size;
    }
    this.search();
  }

  close() {
    this.dialogOptions.visible = false;
  }

}
