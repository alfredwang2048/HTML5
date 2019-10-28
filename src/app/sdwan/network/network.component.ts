import {Component, OnInit, ViewChild} from '@angular/core';
import {PageSize} from '../../model';
import {QueryObject} from '../../base/';
import {SdwanService} from '../../shared/sdwan';
import {CommonWindowComponent} from '../../m-common/common-window/common-window.component';
import {SetManagerComponent} from '../../m-common/set-manager/set-manager.component';
import {NetworkDetailComponent} from './network-detail/network-detail.component';
import {LoadingWindowComponent} from '../../m-common/loading-window/loading-window.component';
import {HelpDocComponent} from '../../m-common/help-doc/help-doc.component';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.styl']
})
export class NetworkComponent implements OnInit {
  deleteCommonOption = {
    width: '450px',
    title: '删除',
    message: ''
  };
  helpDocOption = {
    title: '创建SD-WAN步骤',
    docHrefContent: [
      {text: '产品简介', link: '/docs/sdwan/start'},
      {text: '用户指南', link: '/docs/sdwan/operating_guide'},
      {text: '常见问题', link: '/docs/sdwan/questions_and_answers'},
    ],
    docContent: ['选择三层网络（自动，指定云网络）', '选择云网络（三层网络选择为指定云网络）', '输入互联地址'],
  };
  @ViewChild('delete')
  deleteEleRf: CommonWindowComponent;
  @ViewChild('manager')
  managerRf: SetManagerComponent;
  @ViewChild('detail')
  detailEleRf: NetworkDetailComponent;
  @ViewChild('loading')
  loadingRef: LoadingWindowComponent;
  @ViewChild('helpDoc')
  helpDocRef: HelpDocComponent;

  networks: Array<any> = [];
  gridLoading = true;
  selectedItem: any;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  searchConditions;
  currentRowIndex;

  constructor(private sdServer: SdwanService) {
  }

  ngOnInit() {
    this.search();
  }

  search() {
    const qobj = new QueryObject();
    qobj.start = (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    qobj.conditions = this.searchConditions;
    this.networks = [];
    this.gridLoading = true;
    const sub = this.sdServer.query(qobj, (s, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.networks = s;
      if (total) {
        this.pagination.total = total;
        this.pagination.show = true;
      } else {
        this.pagination.show = false;
      }
    }, true);
  }

  openDeleteWin(detail, a) {
    this.deleteCommonOption.message = `删除操作不可恢复，请确定是否删除：<span class="red">${detail.name}</span>`;
    this.deleteEleRf.open();
  }

  deleteDone() {
    this.sdServer.delete(this.selectedItem, datas => {
      this.search();
    });
  }

  createDone() {
    this.search();
  }

  updateDone() {
    this.search();
  }

  assingDone(params) {
    this.loadingRef.open();
    this.sdServer.assignVpe(params, (data) => {
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

  setManager() {
    this.managerRf.openDialog();
  }

  showDetail(e) {
    this.selectedItem = e.rowData;
    setTimeout(() => {
      this.detailEleRf.open();
    }, 0);
  }

  renewDone() {
  }

  selectedRow(data, rowIndex) {
    this.selectedItem = data;
    this.currentRowIndex = rowIndex;
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

  stopEvent(e) {
    e.stopPropagation();
  }

}
