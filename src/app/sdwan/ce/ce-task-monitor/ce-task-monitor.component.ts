import {Component, Input, OnInit} from '@angular/core';
import {MonitorObject, MonitorService} from '../../../shared/monitor.service';
import { loss_rtt_chart_options, DURATION_OPTIONS } from '../../../model';
import {CpeMonitorTaskInventory} from '../../../shared/sdwan/api';
import {CeInventory} from '../../../shared/sdwan';

@Component({
  selector: 'app-ce-task-monitor',
  templateUrl: './ce-task-monitor.component.html',
  styleUrls: ['./ce-task-monitor.component.styl']
})
export class CeTaskMonitorComponent implements OnInit {

  @Input()
  selectedItem: CpeMonitorTaskInventory;
  @Input()
  selectedCe: CeInventory;
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
  chartOptions;
  mergeOptions;
  isLoading = true;
  noData = false;
  timer: any;
  durationOption: any;
  storageChartData = {
    data: [],
    start: 0,
    end: 0
  };

  constructor(private monitorService: MonitorService) { }

  ngOnInit() {
    const now = new Date();
    const hourMilliSecond = 60 * 60 * 1000;
    this.rangeModel.type = 'hour';
    this.rangeModel.end = now.getTime();
    this.rangeModel.start = now.getTime() - hourMilliSecond;
  }

  reset() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.storageChartData.data = [];
    this.storageChartData.start = 0;
    this.storageChartData.end = 0;
  }

  open() {
    this.dialogOptions.title = '监控详情';
    this.dialogOptions.visible = true;
    this.chartOptions = Object.assign(loss_rtt_chart_options, {
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0]
        }
      ]});
    const now = new Date();
    const hourMilliSecond = 60 * 60 * 1000;
    this.rangeModel.type = 'hour';
    this.rangeModel.end = now.getTime();
    this.rangeModel.start = now.getTime() - hourMilliSecond;
    this.mergeOptions = null;
    this.isLoading = true;
    this.noData = false;
    this.searchHandler();
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
    this.isLoading = true;
    this.noData = false;
    this.storageChartData.start = this.rangeModel.start;
    this.storageChartData.end = this.rangeModel.end;
    this.durationOption = DURATION_OPTIONS.filter(item => (this.rangeModel.end - this.rangeModel.start) > item.during)[0];
    this.cellMonitor(this.storageChartData.start, this.storageChartData.end, (options) => {
      let lastEndDate = this.storageChartData.end;
      this.storageChartData.start = lastEndDate;
      this.storageChartData.end = lastEndDate + this.durationOption.interval;
      this.mergeOptions = options;
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
              this.mergeOptions = chartOptions;
            }
          });
        }, this.durationOption.interval);
      }
    }, this.durationOption.suffix);
  }
  cellMonitor(start, end, done: (chartOptions) => void, suffix = '') {
    const monitorObj = new MonitorObject();
    monitorObj.start = start;
    monitorObj.end = end;
    let monitorSuffixPath = null;
    this.chartOptions = Object.assign(loss_rtt_chart_options, {
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0]
        }
      ]});
    monitorObj.metrics = ['loss', 'rtt', 'jitter'];

    monitorObj.tags = {esn_id: this.selectedCe.esn, if_name: this.selectedItem.dev, target: this.selectedItem.targetIp};
    suffix ? monitorSuffixPath = 'sdwan_ds/' + 'cpe_icmp_from_cpe' + suffix : monitorSuffixPath = 'sdwan/cpe_icmp_from_cpe';
    this.monitorService.vpeLinkMonitor(monitorSuffixPath, [monitorObj]).subscribe((datas: Array<any>) => {
      const seriesArr = [], legend = [], results = datas[0];
      if (results.dps && results.dps.length) {
        for (let j = 0; j < results.metrics.length; j++) {
          legend.push(results.metrics[j] + suffix);
          const lineData = {
            name: results.metrics[j] + suffix,
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
          text: this.selectedItem.dev + '(' + this.selectedItem.targetIp + ')'
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
    clearInterval(this.timer);
  }
}
