import {AfterContentChecked, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {PageSize} from '../../../model';
import {QueryObject} from '../../../base';
import {CeService} from '../../../shared/sdwan/ce.service';

@Component({
  selector: 'app-batch-route-list',
  templateUrl: './batch-route-list.component.html',
  styleUrls: ['./batch-route-list.component.styl']
})
export class BatchRouteListComponent implements OnInit, AfterContentChecked {
  @Input()
    selectedCe: CeInventory;
  @Input()
    resourceQuotaNumber: number;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();
  dialogOptions = {
    title: '设置静态路由',
    width: '600px',
    visible: false,
    changeHeight: 0
  };
  batchs: Array<any> = [];
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

  createRouteDone(params) {
    this.done.emit({type: 'add', data: params});
  }

  clickId() {
    this.selectedCidrs = this.batchs.filter(item => item.status).map(it => it.uuid);
  }

  selectAll(value) {
    if (value) {
      this.batchs.map(item => {
        item.status = true;
      });
    }else {
      this.batchs.map(item => {
        item.status = false;
      });
    }
    this.clickId();
  }

  selectItem(e) {
    e.rowData.status = true;
    this.clickId();
  }

  deleteRoute() {
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
    this.batchs = [];
    if (isCreate) {this.pagination.current = 1; }
    const qobj = new QueryObject();
    qobj.start = isCreate ? 0 : (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    qobj.addCondition({name: 'ceUuid', op: '=', value: this.selectedCe.uuid});
    qobj.sortBy = 'createDate';
    qobj.sortDirection = 'desc';
    this.gridLoading = true;
    const sub = this.ceService.queryBatch(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.batchs = datas;
      if (total) {
        this.batchs.map(item => {
          item.status = false;
        });
      }
      this.pagination.total = total;
      this.pagination.show = total !== 0;
      this.dialogOptions.changeHeight ++;
    });
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
