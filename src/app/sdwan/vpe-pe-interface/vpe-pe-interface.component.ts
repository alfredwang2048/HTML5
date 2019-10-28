import { Component, OnInit, ViewChild } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PageSize} from '../../model';
import {QueryObject} from '../../base';
import * as Util from 'util';
import {VpePeInterfaceInventory, VpeService} from '../../shared/sdwan';
import {VpeDetailComponent} from '../vpe/vpe-detail/vpe-detail.component';
import {CommonWindowComponent} from '../../m-common/common-window/common-window.component';
import {VpePeDetailComponent} from './vpe-pe-detail/vpe-pe-detail.component';
import {LoadingWindowComponent} from '../../m-common/loading-window/loading-window.component';
@Component({
  selector: 'app-vpe-pe-interface',
  templateUrl: './vpe-pe-interface.component.html',
  styleUrls: ['./vpe-pe-interface.component.styl']
})
export class VpePeInterfaceComponent implements OnInit {

  @ViewChild('detail')
  detailEleRf: VpePeDetailComponent;

  @ViewChild('delete')
  deleteEleRf: CommonWindowComponent;
  @ViewChild('loading')
  loadingRef: LoadingWindowComponent;
  deleteCommonOption = {
    width: '300px',
    title: '删除',
    message: ''
  };

  constructor(private vpeService: VpeService,
              private routeInfo: ActivatedRoute) {
  }

  vpePeInterfaceLists: Array<VpePeInterfaceInventory> = [];
  selectedItem: VpePeInterfaceInventory;
  gridLoading = true;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  searchConditions;
  searchInitObj = {name: '', value: ''};

  ngOnInit() {
    this.searchConditions = [];
    this.searchInitObj = {name: '', value: ''};
    const params = this.routeInfo.snapshot.queryParams;
    if (params.value1) {
      if (params.value2) {
        this.searchConditions = [{name: params.name, op: 'in', value: [params.value1, params.value2].join(',')}];
      }else {
        this.searchConditions = [{name: params.name, op: '=', value: params.value1}];
      }
    }else {
      if (!Util.isUndefined(params.value)) {
        this.searchConditions = [{name: params.name, op: '=', value: params.value}];
        this.searchInitObj = {name: params.name, value: params.value};
      }
    }
    this.search();
  }

  search() {
    const qobj = new QueryObject();
    qobj.conditions = this.searchConditions;
    qobj.start = (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    this.vpePeInterfaceLists = [];
    this.gridLoading = true;
    const sub = this.vpeService.queryVpePeInterface(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.vpePeInterfaceLists = datas;
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

  selectedRow(data) {
    this.selectedItem = data;
  }

  searchDone(conds) {
    this.searchConditions = conds;
    this.pagination.current = 1;
    this.search();
  }

  openDeleteWin(e, detail) {
    e.stopPropagation();
    this.selectedItem = detail;
    this.deleteCommonOption.message = `删除操作不可恢复，请确定是否删除VPE-PE接口：<span class="red">${detail.uuid}</span>`;
    this.deleteEleRf.open();
  }

  deleteDone() {
    this.loadingRef.open();
    this.vpeService.deleteVpePeInterface(this.selectedItem, datas => {
      this.loadingRef.cancel();
      this.search();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  showDetail(e) {
    this.selectedItem = e.rowData;
    setTimeout(() => {
      this.detailEleRf.open();
    }, 0);
  }
}
