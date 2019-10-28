import {AfterContentChecked, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeService, HaInventory, HaService} from '../../../shared/sdwan';
import {PageSize} from '../../../model';
import {QueryObject} from '../../../base';

@Component({
  selector: 'app-ha-batch-cidr-list',
  templateUrl: './ha-batch-cidr-list.component.html',
  styleUrls: ['./ha-batch-cidr-list.component.styl']
})
export class HaBatchCidrListComponent implements OnInit, AfterContentChecked {

  @Input()
  selectedHa: HaInventory;
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
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  gridLoading = true;
  serviceCidrs = [];
  selectedCidrs = [];
  master = false;

  constructor(private ceService: CeService) {
  }

  ngOnInit() {
  }

  ngAfterContentChecked() {
    this.dialogOptions.changeHeight++;
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.selectedCidrs = [];
    this.gridLoading = false;
    this.master = false;
    this.pagination.current = 1;
    /*if (inventories) {
      if (inventories.length > 10) {
        this.serviceCidrs = inventories.slice(0, 10);
      }else {
        this.serviceCidrs = inventories;
      }
      this.serviceCidrs.map(item => {
        item.status = false;
      });
      this.pagination.total = inventories.length;
      this.pagination.show = inventories.length === 0 ? false : true;
    }else {
      this.serviceCidrs = [];
    }*/
    this.search();
  }

  reset() {
    this.selectedCidrs = [];
    this.master = false;
  }

  clickId() {
    this.selectedCidrs = this.serviceCidrs.filter(item => item.status).map(it => it.uuid);
  }

  selectAll(value) {
    if (value) {
      this.serviceCidrs.map(item => {
        item.status = true;
      });
    } else {
      this.serviceCidrs.map(item => {
        item.status = false;
      });
    }
    this.clickId();
  }

  /*search() {
    this.serviceCidrs = [];

    this.gridLoading = true;
    this.haService.getHaGroup(this.selectedHa.uuid, (datas) => {
      this.gridLoading = false;
      if (datas.serviceCidrInventory.length > 10) {
        this.serviceCidrs = datas.serviceCidrInventory.slice((this.pagination.current - 1) * 10, this.pagination.current * 10);
      }else {
        this.serviceCidrs = datas.serviceCidrInventory;
      }
      this.serviceCidrs.map(item => {
        item.status = false;
      });
      this.pagination.total = datas.serviceCidrInventory.length;
      this.pagination.show = datas.serviceCidrInventory.length === 0 ? false : true;
      this.dialogOptions.changeHeight ++;
    });
  }*/

  search(isCreate = false) {
    this.serviceCidrs = [];
    this.gridLoading = true;
    if (isCreate) {this.pagination.current = 1; }
    const qobj = new QueryObject();
    qobj.start = isCreate ? 0 : (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    qobj.sortBy = 'createDate';
    qobj.sortDirection = 'desc';
    qobj.addCondition({name: 'resourceUuid', op: '=', value: this.selectedHa.uuid});
    qobj.addCondition({name: 'resourceType', op: '=', value: 'HaGroupVO'});
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

  selectItem(e) {
    e.rowData.status = true;
    this.clickId();
  }

  createServiceCidrDone(params) {
    this.done.emit({type: 'add', data: params});
  }

  deleteServiceCidr() {
    const infoPage = {
      haGroupUuid: this.selectedHa.uuid,
      uuids: this.selectedCidrs
    };
    this.selectedCidrs = [];
    this.done.emit({type: 'delete', data: infoPage});
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
