import { Component, OnInit, ViewChild } from '@angular/core';
import {LinkMonitorService, VPELinkMonitorInventory} from '../../shared/sdwan';
import {PageSize} from '../../model';
import {QueryObject} from '../../base';
import { LinkMonitorDetailComponent } from './link-monitor-detail/link-monitor-detail.component';
import { MonitorChartComponent } from './monitor-chart/monitor-chart.component';
import {ActivatedRoute} from '@angular/router';
import * as Util from "util";

@Component({
  selector: 'app-link-monitor',
  templateUrl: './link-monitor.component.html',
  styleUrls: ['./link-monitor.component.styl']
})
export class LinkMonitorComponent implements OnInit {

  constructor(private monitorService: LinkMonitorService,
              private routeInfo: ActivatedRoute) {
  }
  vpeLists: Array<VPELinkMonitorInventory> = [];
  selectedItem: VPELinkMonitorInventory;
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

  @ViewChild('detail')
  detailEleRf: LinkMonitorDetailComponent;
  @ViewChild('chartWin')
  chartEleRef: MonitorChartComponent;
  ngOnInit() {
    this.searchConditions = [];
    this.searchInitObj = {name: '', value: ''};
    const params = this.routeInfo.snapshot.queryParams;
    if (!Util.isUndefined(params.value)) {
      this.searchConditions = [{name: params.alisName || params.name, op: '=', value: params.value}];
      this.searchInitObj = {name: params.name, value: params.value};
    }

    this.search();
  }

  search() {
    const qobj = new QueryObject();
    qobj.conditions = this.searchConditions;
    qobj.start = (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    this.vpeLists = [];
    this.gridLoading = true;
    const sub = this.monitorService.query(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.vpeLists = datas;
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
  showDetail(e) {
    this.selectedItem = e.rowData;
    setTimeout(() => {
      this.detailEleRf.open();
    }, 0);
  }
  openMonitor(vpeLink, e) {
    e.stopPropagation();
    this.selectedItem = vpeLink;
    setTimeout(() => {
      this.chartEleRef.open();
    }, 5);
  }
}
