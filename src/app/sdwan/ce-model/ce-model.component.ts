import { Component, OnInit, ViewChild } from '@angular/core';
import {CeModelInventory, CeModelService} from '../../shared/sdwan';
import {PageSize} from '../../model';
import {QueryObject} from '../../base';
import {CeModelDetailComponent} from './ce-model-detail/ce-model-detail.component';
@Component({
  selector: 'app-ce-model',
  templateUrl: './ce-model.component.html',
  styleUrls: ['./ce-model.component.styl']
})
export class CeModelComponent implements OnInit {
  @ViewChild('detailRef')
  detailRef: CeModelDetailComponent;
  modelLists: Array<CeModelInventory> = [];
  selectedItem: CeModelInventory;
  gridLoading = true;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  searchConditions;
  constructor(private ceModelService: CeModelService) { }

  ngOnInit() {
    this.search();
  }

  search() {
    const qobj = new QueryObject();
    qobj.conditions = this.searchConditions;
    qobj.start = (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    this.modelLists = [];
    this.gridLoading = true;
    const sub = this.ceModelService.query(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.modelLists = datas;
      if (total) {
        this.pagination.show = true;
        this.pagination.total = total;
      } else {
        this.pagination.show = false;
      }
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
  showDetail(e) {
    this.selectedItem = e.rowData;
    setTimeout(() => {
      this.detailRef.open();
    }, 0);
  }
}
