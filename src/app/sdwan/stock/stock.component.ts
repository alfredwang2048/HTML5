import {Component, OnInit, ViewChild} from '@angular/core';
import {PageSize} from '../../model';
import {CeInventory, StockInventory} from '../../shared/sdwan';
import {QueryObject} from '../../base';
import * as Util from 'util';
import {ActivatedRoute} from '@angular/router';
import {StockService} from '../../shared/sdwan/stock.service';
import {LoadingWindowComponent} from '../../m-common/loading-window/loading-window.component';
import {CommonWindowComponent} from '../../m-common/common-window/common-window.component';
import {arrayUpdateItem} from '../../model/utils';
import {NetworkDetailComponent} from '../network/network-detail/network-detail.component';
import {StockDetailComponent} from './stock-detail/stock-detail.component';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.styl']
})
export class StockComponent implements OnInit {

  deleteCommonOption = {
    width: '500px',
    title: '删除',
    message: ''
  };
  initCommonOption = {
    width: '500px',
    title: '初始化库存',
    message: ''
  };
  @ViewChild('delete')
    deleteEleRf: CommonWindowComponent;
  @ViewChild('init')
    initEleRf: CommonWindowComponent;
  @ViewChild('loading')
    loadingRef: LoadingWindowComponent;
  @ViewChild('detail')
    detailEleRf: StockDetailComponent;
  stocks: Array<any> = [];
  gridLoading = true;
  selectedDetailIndex: number;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  selectedStock: StockInventory;
  searchConditions;
  searchInitObj = {name: '', value: ''};
  constructor(
    private routeInfo: ActivatedRoute,
    private stockService: StockService
  ) { }

  ngOnInit() {
    const params = this.routeInfo.snapshot.queryParams;
    if (!Util.isUndefined(params.value)) {
      this.searchConditions = [{name: params.name, op: '=', value: params.value}];
      this.searchInitObj = {name: params.name, value: params.value};
    }
    this.search();
  }

  openDeleteWin(detail, index) {
    this.selectedDetailIndex = index;
    this.deleteCommonOption.message = `删除操作不可恢复，请确认是否删除CPE：<span class="red">${detail.name}</span>`;
    this.deleteEleRf.open();
  }

  openInitWin(detail, index) {
    this.selectedDetailIndex = index;
    this.initCommonOption.message = `执行初始化，数据不可恢复，请确定是否初始化：<span class="red">${detail.name}</span>`;
    this.initEleRf.open();
  }

  deleteDone() {
    this.loadingRef.open();
    this.stockService.delete(this.selectedStock, () => {
      this.loadingRef.cancel();
      arrayUpdateItem(this.stocks, this.selectedStock, 'delete');
    }, () => {
      this.loadingRef.cancel();
    });
  }

  initDone() {
    this.loadingRef.open();
    this.stockService.init(this.selectedStock, (data) => {
      this.loadingRef.cancel();
      arrayUpdateItem(this.stocks, data, 'update');
    }, () => {
      this.loadingRef.cancel();
    });
  }

  attachAccountDone(params) {
    this.loadingRef.open();
    this.stockService.attachAccount(params, (data) => {
      this.loadingRef.cancel();
      this.search();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  searchDone(conds) {
    this.searchConditions = conds;
    this.pagination.current = 1;
    this.search();
  }

  createStockDone(params) {
    this.loadingRef.open();
    this.stockService.create(params, (data) => {
      this.loadingRef.cancel();
      this.search();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  search() {
    const qobj = new QueryObject();
    qobj.conditions = this.searchConditions;
    qobj.start = (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    this.stocks = [];
    this.gridLoading = true;
    const sub = this.stockService.query(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.stocks = datas;
      if (total) {
        this.pagination.total = total;
        this.pagination.show = true;
      } else {
        this.pagination.show = false;
      }
    });
  }

  showDetail(e) {
    this.selectedStock = e.rowData;
    setTimeout(() => {
      this.detailEleRf.open();
    }, 0);
  }

  selectedRow(data) {
    this.selectedStock = data;
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

  isActionShow(dataItem: CeInventory, action) {
    if (dataItem) {
      if (action === 'switchMaster') {
        return dataItem.connectionType === 'SDWAN' &&
          dataItem.frpStatus === 'online' &&
          dataItem.configStatus === 'Config';
      } else if (action === 'configCifr') {
        return !(dataItem.configStatus === 'Config' && dataItem.state === 'Enabled' && dataItem.frpStatus === 'offline') && dataItem.connectionType !== 'TUNNEL';
      }else if (action === 'disable') {
        return dataItem.state === 'Enabled' && !(dataItem.configStatus === 'Config' && dataItem.frpStatus === 'offline');
      }else if (action === 'enable') {
        return dataItem.state === 'Disabled' && !(dataItem.configStatus === 'Config' && dataItem.frpStatus === 'offline');
      }else if (action === 'delete') {
        return dataItem.state === 'Disabled';
      }else if (action === 'fDelete') {
        return dataItem.configStatus === 'Config' && dataItem.state === 'Enabled' && dataItem.frpStatus === 'offline';
      }else if (action === 'init') {
        return dataItem.frpStatus !== 'offline';
      }
    }
  }

}
