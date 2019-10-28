import {AfterContentChecked, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {PageSize} from '../../../model';
import {CeService} from '../../../shared/sdwan/ce.service';
import {QueryObject} from '../../../base';

@Component({
  selector: 'app-batch-service-cidr-list',
  templateUrl: './batch-service-cidr-list.component.html',
  styleUrls: ['./batch-service-cidr-list.component.styl']
})
export class BatchServiceCidrListComponent implements OnInit, AfterContentChecked {
  @Input()
    selectedCe: CeInventory;
  @Input()
    resourceQuotaNumber: number;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();
  dialogOptions = {
    title: '设置业务网段',
    width: '600px',
    visible: false,
    changeHeight: 0
  };
  serviceCidrs: Array<any> = [];
  gridLoading = true;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  selectedCidrs: Array<string> = [];
  input_box = false;
  constructor(
    private ceService: CeService
  ) { }

  ngOnInit() {
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.selectedCidrs = [];
    this.input_box = false;
    this.pagination.current = 1;
    this.search();
  }

  ngAfterContentChecked() {
    this.dialogOptions.changeHeight ++;
  }

  createServiceCidrDone(params) {
    this.done.emit({type: 'add', data: params});
  }

  clickId() {
    this.selectedCidrs = this.serviceCidrs.filter(item => item.status).map(it => it.uuid);
  }

  selectAll(value) {
    if (value) {
      this.serviceCidrs.map(item => {
        item.status = true;
      });
    }else {
      this.serviceCidrs.map(item => {
        item.status = false;
      });
    }
    this.clickId();
  }

  selectItem(e) {
    e.rowData.status = true;
    this.clickId();
  }

  deleteServiceCidr() {
    const infoPage = {
      ceUuid: this.selectedCe.uuid,
      uuids: this.selectedCidrs
    };
    this.done.emit({type: 'delete', data: infoPage});
  }

  reset() {
    this.selectedCidrs = [];
    this.input_box = false;
  }

  search(isCreate = false) {
    this.serviceCidrs = [];
    this.gridLoading = true;
    if (isCreate) {this.pagination.current = 1; }
    const qobj = new QueryObject();
    qobj.start = isCreate ? 0 : (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    qobj.sortBy = 'createDate';
    qobj.sortDirection = 'desc';
    qobj.addCondition({name: 'resourceUuid', op: '=', value: this.selectedCe.uuid});
    qobj.addCondition({name: 'resourceType', op: '=', value: 'CeVO'});
    const sub = this.ceService.queryServiceCidr(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.serviceCidrs = datas;
      this.serviceCidrs.map(item => {
        item.status = false;
      });
      this.pagination.total = total;
      this.pagination.show = total !== 0;
      this.dialogOptions.changeHeight ++;
    });
  }

  close() {
    this.dialogOptions.visible = false;
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

}
