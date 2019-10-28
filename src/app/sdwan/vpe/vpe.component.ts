import {Component, OnInit, ViewChild} from '@angular/core';
import {VpeInventory, VpeService} from '../../shared/sdwan';
import {PageSize} from '../../model';
import {QueryObject} from '../../base';
import {VpeDetailComponent} from './vpe-detail/vpe-detail.component';
import {CommonWindowComponent} from '../../m-common/common-window/common-window.component';
import {LoadingWindowComponent} from '../../m-common/loading-window/loading-window.component';

@Component({
  selector: 'app-vpe',
  templateUrl: './vpe.component.html',
  styleUrls: ['./vpe.component.styl']
})
export class VpeComponent implements OnInit {

  @ViewChild('detail')
  detailEleRf: VpeDetailComponent;
  @ViewChild('loading')
  loadingRef: LoadingWindowComponent;
  @ViewChild('setState')
  setStateEleRf: CommonWindowComponent;
  setStateCommonOption = {
    width: '450px',
    title: '',
    tips: '',
    message: ''
  };
  @ViewChild('delete')
  deleteEleRf: CommonWindowComponent;
  deleteCommonOption = {
    width: '275px',
    title: '删除',
    message: ''
  };
  @ViewChild('reconnect')
  reconnectEleRf: CommonWindowComponent;
  reconnectCommonOption = {
    width: '275px',
    title: '重连',
    message: ''
  };

  vpeLists: Array<VpeInventory> = [];
  gridLoading = true;
  selectedItem: VpeInventory;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  searchConditions;

  constructor(private vpeService: VpeService) {
  }

  ngOnInit() {
    this.search();
  }

  search() {
    const qobj = new QueryObject();
    qobj.conditions = this.searchConditions;
    qobj.start = (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    this.vpeLists = [];
    this.gridLoading = true;
    const sub = this.vpeService.query(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.vpeLists = datas;
      if (total) {
        this.pagination.show = true;
        this.pagination.total = total;
      } else {
        this.pagination.show = false;
      }
    }, true);
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

  showDetail(e) {
    this.selectedItem = e.rowData;
    setTimeout(() => {
      this.detailEleRf.open();
    }, 0);
  }

  doneCreate(event) {
    /*this.search();*/
    this.loadingRef.open();
    if (event.type === 'add') {
      this.vpeService.create(event.data, (res) => {
        this.loadingRef.cancel();
        this.search();
      }, () => {
        this.loadingRef.cancel();
      });
    }
  }

  doneSearch() {
    this.search();
  }

  openSetStateWin(detail) {
    if (detail.state === 'Enabled') {
      this.setStateCommonOption.title = `禁用`;
      this.setStateCommonOption.tips = `禁用后该VPE将无法与网络互通，相关业务可能会有影响，请谨慎操作。`;
      this.setStateCommonOption.message = `请确定是否禁用VPE：<span class="red">${detail.name}</span>`;
    } else if (detail.state === 'Disabled') {
      this.setStateCommonOption.title = `启用`;
      this.setStateCommonOption.message = `请确定是否启用VPE：<span class="red">${detail.name}</span>`;
    }
    this.setStateEleRf.open();
  }

  setStateDone() {
    if (this.selectedItem.state === 'Enabled') {
      this.vpeService.disable(this.selectedItem, datas => {
        this.search();
      });
    } else if (this.selectedItem.state === 'Disabled') {
      this.vpeService.enable(this.selectedItem, datas => {
        this.search();
      });
    }
  }

  openDeleteWin(detail) {
    this.deleteCommonOption.message = `删除操作不可恢复，请确定是否删除VPE：<span class="red">${detail.name}</span>`;
    this.deleteEleRf.open();
  }

  deleteDone() {
    this.vpeService.delete(this.selectedItem, datas => {
      this.search();
    });
  }

  openReconnect(detail) {
    this.reconnectCommonOption.message = ` 请确定是否重新连接VPE：<span class="red">${detail.name}</span>`;
    this.reconnectEleRf.open();
  }

  reconnectDone() {
    this.selectedItem.status = 'Connecting';
    this.vpeService.reconnect(this.selectedItem, datas => {
      this.search();
    });
  }

}

export const PublicNetworkType = [
  {
    name: '电信',
    value: 'CTCC'
  }, {
    name: '移动',
    value: 'CMCC'
  }, {
    name: '联通',
    value: 'CUCC'
  }, {
    name: 'BGP',
    value: 'BGP'
  }, {
    name: 'CBN',
    value: '广电'
  }, {
    name: 'CERN',
    value: '教育网'
  }, {
    name: 'BGP1',
    value: 'BGP1'
  }, {
    name: 'BGP2',
    value: 'BGP2'
  }, {
    name: 'OTHE',
    value: '其他'
  },
];























