import {AfterContentChecked, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {PageSize} from '../../../model';
import {QueryObject} from '../../../base';
import {CeService} from '../../../shared/sdwan/ce.service';

@Component({
  selector: 'app-batch-target-cidr-list',
  templateUrl: './batch-target-cidr-list.component.html',
  styleUrls: ['./batch-target-cidr-list.component.styl']
})
export class BatchTargetCidrListComponent implements OnInit, AfterContentChecked {
  @Input()
    selectedCe: CeInventory;
  @Input()
    resourceQuotaNumber: number;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();
  dialogOptions = {
    title: '设置目标网段',
    width: '600px',
    visible: false,
    changeHeight: 0
  };
  targetCidrs: Array<any> = [];
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

  createTargetCidrDone(params) {
    this.done.emit({type: 'add', data: params});
  }

  clickId() {
    this.selectedCidrs = this.targetCidrs.filter(item => item.status).map(it => it.targetCidr);
  }

  selectAll(value) {
    if (value) {
      this.targetCidrs.map(item => {
        item.status = true;
      });
    }else {
      this.targetCidrs.map(item => {
        item.status = false;
      });
    }
    this.clickId();
  }

  selectItem(e) {
    e.rowData.status = true;
    this.clickId();
  }

  deleteTargetCidr() {
    const infoPage = {
      ceUuid: this.selectedCe.uuid,
      targetCidrs: this.selectedCidrs
    };
    this.done.emit({type: 'delete', data: infoPage});
  }

  reset() {
    this.selectedCidrs = [];
    this.input_box = false;
  }

  search(isCreate = false) {
    this.targetCidrs = [];
    this.gridLoading = true;
    if (isCreate) {this.pagination.current = 1; }
    const qobj = new QueryObject();
    qobj.start = isCreate ? 0 : (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    qobj.sortBy = 'createDate';
    qobj.sortDirection = 'desc';
    qobj.addCondition({name: 'ceUuid', op: '=', value: this.selectedCe.uuid});
    const sub = this.ceService.queryTargetCidr(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.targetCidrs = datas;
      if (total) {
        this.targetCidrs.map(item => {
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
