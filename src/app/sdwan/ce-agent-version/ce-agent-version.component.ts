import { Component, OnInit, ViewChild } from '@angular/core';
import {AgentVersionInventory, AgentVersionService} from '../../shared/sdwan';
import {PageSize} from '../../model';
import {QueryObject} from '../../base';
import { CeAgentVersionUpdateComponent } from './ce-agent-version-update/ce-agent-version-update.component';
import {CommonWindowComponent} from '../../m-common/common-window/common-window.component';
import {LoadingWindowComponent} from '../../m-common/loading-window/loading-window.component';
import {arrayUpdateItem} from '../../model/utils';
@Component({
  selector: 'app-ce-agent-version',
  templateUrl: './ce-agent-version.component.html',
  styleUrls: ['./ce-agent-version.component.styl']
})
export class CeAgentVersionComponent implements OnInit {

  constructor(private versionService: AgentVersionService) { }
  versionLists: Array<AgentVersionInventory> = [];
  selectedItem: AgentVersionInventory;
  gridLoading = true;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  searchConditions;
  deleteCommonOption = {
    width: '500px',
    title: '删除',
    message: ''
  };
  navTabLists = [{text: 'vyos', value: 'vyos'}, {text: 'openwrt', value: 'openwrt'}, {text: 'app', value: 'app'}];
  currentTab = this.navTabLists[0];
  @ViewChild('delete')
  deleteEleRf: CommonWindowComponent;
  @ViewChild('loading')
  loadingRef: LoadingWindowComponent;
  @ViewChild('update')
  updateRef: CeAgentVersionUpdateComponent;
  ngOnInit() {
    this.search();
  }

  search() {
    const qobj = new QueryObject();
    qobj.conditions = this.searchConditions;
    qobj.start = (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    this.versionLists = [];
    this.gridLoading = true;
    qobj.addCondition({name: 'os', op: '=', value: this.currentTab.value});
    const sub = this.versionService.query(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.versionLists = datas;
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

  // 切换类型
  navTabsDone(type) {
    setTimeout(() => {
      this.search();
    });
  }
  /*searchDone(conds) {
    this.searchConditions = conds;
    this.pagination.current = 1;
    this.search();
  }*/

  createDone(versionInv) {
    this.loadingRef.open();
    versionInv.os = this.currentTab.value;
    this.versionService.create(versionInv, (data) => {
      this.loadingRef.cancel();
      arrayUpdateItem(this.versionLists, data, 'add', this.pagination.size);
      if (!this.pagination.show) {
        this.pagination.total = 1;
        this.pagination.show = true;
      }
    }, () => {
      this.loadingRef.cancel();
    });
  }
  openUpdateWin() {
    setTimeout(() => {
      this.updateRef.open();
    }, 0);
  }
  updateDone(versionInv) {
    this.loadingRef.open();
    this.versionService.update(versionInv, (data) => {
      this.loadingRef.cancel();
      arrayUpdateItem(this.versionLists, data, 'update');
    }, () => {
      this.loadingRef.cancel();
    });
  }
  openDeleteWin() {
    this.deleteCommonOption.message = `删除操作不可恢复，请确认是否删除Agent版本：<span class="red">${this.selectedItem.version}</span>`;
    this.deleteEleRf.open();
  }
  deleteDone() {
    this.loadingRef.open();
    this.versionService.delete(this.selectedItem, () => {
      this.loadingRef.cancel();
      arrayUpdateItem(this.versionLists, this.selectedItem, 'delete');
      if (this.versionLists.length === 0) {
        this.pagination.show = false;
      }
    }, () => {
      this.loadingRef.cancel();
    });
  }
}
