import {Component, OnInit, ViewChild} from '@angular/core';
import {IpInfoInventory, VpeService} from '../../shared/sdwan';
import {PageSize} from '../../model';
import {QueryObject} from '../../base';
import {MonitorChartComponent} from '../link-monitor/monitor-chart/monitor-chart.component';
import {PublicNetworkMonitorChartComponent} from './monitor-chart/monitor-chart.component';
import * as Util from "util";
import {ActivatedRoute} from '@angular/router';
@Component({
  selector: 'app-public-network-monitor',
  templateUrl: './public-network-monitor.component.html',
  styleUrls: ['./public-network-monitor.component.styl']
})
export class PublicNetworkMonitorComponent implements OnInit {

  @ViewChild('chartWin')
  chartEleRef: PublicNetworkMonitorChartComponent;

  vpeLists: Array<IpInfoInventory> = [];
  gridLoading = true;
  selectedItem: IpInfoInventory;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  searchConditions;
  searchInitObj = {name: '', value: ''};

  constructor(private vpeService: VpeService,
              private routeInfo: ActivatedRoute) { }

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
    const sub = this.vpeService.queryVpeIpInfo(qobj, (datas, total) => {
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

  openMonitor(item, e) {
    e.stopPropagation();
    this.selectedItem = item;
    setTimeout(() => {
      this.chartEleRef.open();
    }, 5);
  }
}
