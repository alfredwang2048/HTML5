import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import {VPELinkMonitorInventory} from '../../../shared/sdwan';
import {MonitorService, MonitorObject} from '../../../shared/monitor.service';
import {loss_rtt_chart_options, DURATION_OPTIONS, rate_chart_options} from '../../../model';
@Component({
  selector: 'app-public-network-monitor-chart',
  templateUrl: './monitor-chart.component.html',
  styleUrls: ['./monitor-chart.component.styl']
})
export class PublicNetworkMonitorChartComponent implements OnInit, OnDestroy {
  @Input()
  selectedItem: any;
  dialogOptions = {
    width: '740px',
    title: '监控详情',
    visible: false
  };
  rangeModel = {
    type: null,
    start: null,
    end: null
  };
  chartOptions = Object.assign(rate_chart_options, {
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0]
      }
    ]});
  mergeChartOptions: any;
  isLoading = true;
  noData = false;
  timer: any;
  durationOption: any;
  storageChartData = {
    data: [],
    start: 0,
    end: 0
  };
  chartInstance: any;
  flowTypes = [{text: '流量'}, {text: '数据包'}];
  metricList = [{a: 'in_rate', b: 'out_rate'}, {a: 'in_pkts_rate', b: 'out_pkts_rate'}];
  currentFlow = '流量';
  metric = this.metricList[0];

  constructor(private monitorService: MonitorService) {
  }

  ngOnInit() {
    const now = new Date();
    const hourMilliSecond = 60 * 60 * 1000;
    this.rangeModel.type = 'hour';
    this.rangeModel.end = now.getTime();
    this.rangeModel.start = now.getTime() - hourMilliSecond;
  }
  ngOnDestroy() {
    this.reset();
  }
  open() {
    this.currentFlow = '流量';
    this.metric = this.metricList[0];

    this.dialogOptions.visible = true;
    const now = new Date();
    this.rangeModel.type = 'hour';
    const hourMilliSecond = 60 * 60 * 1000;
    this.rangeModel.end = now.getTime();
    this.rangeModel.start = now.getTime() - hourMilliSecond;
    this.searchHandler();
  }
  reset() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.storageChartData.data = [];
    this.storageChartData.start = 0;
    this.storageChartData.end = 0;
  }
  searchHandler() {
    if (this.rangeModel.type !== 'custom') {
      const now = new Date();
      const cut = this.rangeModel.end - this.rangeModel.start;
      this.rangeModel.end = now.getTime();
      this.rangeModel.start = now.getTime() - cut;
    }
    if (this.rangeModel.start && this.rangeModel.end) {
      this.reset();
      this.queryMonitor();
    }
  }
  queryMonitor() {
    // 第一次请求数据初始化
    this.isLoading = true;
    this.noData = false;
    this.storageChartData.start = this.rangeModel.start;
    this.storageChartData.end = this.rangeModel.end;
    this.durationOption = DURATION_OPTIONS.filter(item => (this.rangeModel.end - this.rangeModel.start) > item.during)[0];

    this.cellMonitor(this.storageChartData.start, this.storageChartData.end, (options) => {
      let lastEndDate = this.storageChartData.end;
      this.storageChartData.start = lastEndDate;
      this.storageChartData.end = lastEndDate + this.durationOption.interval;
      this.mergeChartOptions = options;
      this.storageChartData.data = options.series;
      if (options.series.length) {
        this.noData = false;
        this.isLoading = false;
      }else {
        this.noData = true;
        this.isLoading = false;
      }
      if (!this.noData && !this.isLoading && this.rangeModel.type !== 'custom') {
        this.timer = setInterval(() => {
          this.cellMonitor(this.storageChartData.start, this.storageChartData.end, (chartOptions) => {
            lastEndDate = this.storageChartData.end;
            this.storageChartData.start = lastEndDate;
            this.storageChartData.end = new Date().getTime();
            if (chartOptions.series.length) {
              chartOptions.series.forEach((series, index) => {
                const concatData = this.storageChartData.data[index].data.slice(this.durationOption.dataTick).concat(series.data);
                series.data = this.storageChartData.data[index].data = concatData;
              });
              this.mergeChartOptions = chartOptions;
            }
          });
        }, this.durationOption.interval);
      }
    });
  }

  cellMonitor(start, end, done: (chartOptions) => void) {
    const monitorObj = new MonitorObject();
    monitorObj.start = start;
    monitorObj.end = end;
    const monitorSuffixPath = 'sdwan/vpe_public_traffic';
    monitorObj.tags = {device_ip: this.selectedItem.vpeManageIp, if_name: this.selectedItem.interfaceName};
    monitorObj.metrics = [this.metric.a, this.metric.b];
    this.monitorService.vpeLinkMonitor(monitorSuffixPath, [monitorObj]).subscribe((datas: Array<any>) => {
      const seriesArr = [], legend = [], results = datas[0];
      if (results.dps && results.dps.length) {
        for (let j = 0; j < results.metrics.length; j++) {
          legend.push(results.metrics[j]);
          const lineData = {
            name: results.metrics[j],
            yAxisIndex: results.metrics[j].indexOf('rtt') > -1 ? 1 : 0,
            type: 'line',
            showSymbol: false,
            smooth: false,
            areaStyle: {opacity: 0.1},
            data: []
          };
          results.dps.forEach( it => {
            lineData.data.push([parseFloat(it[0]) * 1000, it[j + 1]]);
          });
          seriesArr.push(lineData);
        }
      }
      done({
        series: seriesArr,
        legend: {
          data: legend
        },
        title: {
          text: this.selectedItem.vpeName
        }
      });
    });
  }

  visibleChange(visible: boolean) {
    if (!visible && this.timer) {
      clearInterval(this.timer);
    }
  }
  close() {
    this.dialogOptions.visible = false;
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  selectFlow(item) {
    this.currentFlow = item;
    if (item === '流量') {
      this.metric = this.metricList[0];
    } else {
      this.metric = this.metricList[1];
    }
    this.searchHandler();
  }
}
