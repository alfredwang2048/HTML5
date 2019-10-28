import { Component, OnInit, Input } from '@angular/core';
import {MonitorService, MonitorObject} from '../../../shared/monitor.service';
import {
  DURATION_OPTIONS,
  cpu_chart_options,
  mem_chart_options
} from '../../../model';

@Component({
  selector: 'app-system-mointor',
  templateUrl: './system-mointor.component.html',
  styleUrls: ['./system-mointor.component.styl']
})
export class SystemMointorComponent implements OnInit {
  @Input()
  esn_id: string;
  dialogOptions = {
    width: '1100px',
    title: '监控详情',
    visible: false
  };
  rangeModel = {
    type: null,
    start: null,
    end: null
  };
  chartArray;
  monitorInfos = [];
  durationOption: any;
  constructor(private monitorService: MonitorService) { }

  ngOnInit() {
    const now = new Date();
    const hourMilliSecond = 60 * 60 * 1000;
    this.rangeModel.type = 'hour';
    this.rangeModel.end = now.getTime();
    this.rangeModel.start = now.getTime() - hourMilliSecond;
  }

  open() {
    this.dialogOptions.title = '监控详情';
    this.chartArray = [];
    const now = new Date();
    this.rangeModel.type = 'hour';
    const hourMilliSecond = 60 * 60 * 1000;
    this.rangeModel.end = now.getTime();
    this.rangeModel.start = now.getTime() - hourMilliSecond;

    this.monitorInfos = [ '内存', 'CPU'];
    this.chartArray = [
      {
        options: Object.assign(cpu_chart_options, {
            dataZoom: [
              {
                type: 'inside',
                xAxisIndex: [0]
              }
            ]}),
        merge: null,
        isLoading: true,
        noData: false,
        timer: null,
        storageChartData: {
          data: [],
          start: 0,
          end: 0
        }
      },
      {
        options: Object.assign(mem_chart_options, {
          dataZoom: [
            {
              type: 'inside',
              xAxisIndex: [0]
            }
          ]}),
        merge: null,
        isLoading: true,
        noData: false,
        timer: null,
        storageChartData: {
          data: [],
          start: 0,
          end: 0
        }
      }
    ];

    this.dialogOptions.visible = true;
    this.searchHandler();
  }
  reset() {
    this.chartArray.forEach((item) => {
      if (item.timer) {
        clearInterval(item.timer);
      }
      item.storageChartData.data = [];
      item.storageChartData.start = 0;
      item.storageChartData.end = 0;
    });
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
    this.durationOption = DURATION_OPTIONS.filter(item => (this.rangeModel.end - this.rangeModel.start) > item.during)[0];
    this.monitorInfos.forEach((item, index) => {
        this.chartArray[index].isLoading = true;
        this.chartArray[index].noData = false;
        this.chartArray[index].storageChartData.start = this.rangeModel.start;
        this.chartArray[index].storageChartData.end = this.rangeModel.end;
        this.cellMonitor(this.chartArray[index].storageChartData.start, this.chartArray[index].storageChartData.end, index, (chartOptions) => {
          let lastEndDate = this.chartArray[index].storageChartData.end;
          this.chartArray[index].storageChartData.start = lastEndDate;
          this.chartArray[index].storageChartData.end = lastEndDate + this.durationOption.interval;
          this.chartArray[index].merge = chartOptions;
          this.chartArray[index].storageChartData.data = chartOptions.series;
          if (chartOptions.series.length) {
            this.chartArray[index].noData = false;
            this.chartArray[index].isLoading = false;
          }else {
            this.chartArray[index].noData = true;
            this.chartArray[index].isLoading = false;
          }
          if (!this.chartArray[index].noData && !this.chartArray[index].isLoading && this.rangeModel.type !== 'custom') {
            this.chartArray[index].timer = setInterval(() => {
              this.cellMonitor(this.chartArray[index].storageChartData.start, this.chartArray[index].storageChartData.end, index, (options) => {
                lastEndDate = this.chartArray[index].storageChartData.end;
                this.chartArray[index].storageChartData.start = lastEndDate;
                this.chartArray[index].storageChartData.end = new Date().getTime();
                if (options.series.length) {
                  options.series.forEach((series, i) => {
                    const concatData = this.chartArray[index].storageChartData.data[i].data.slice(this.durationOption.dataTick).concat(series.data);
                    series.data = this.chartArray[index].storageChartData.data[i].data = concatData;
                  });
                  this.chartArray[index].merge = options;
                }
              });
            }, this.durationOption.interval);
          }
        }, this.durationOption.suffix);
      });
  }
  cellMonitor(start, end, index, done: (chartOptions) => void, suffix = '') {
    const monitorObj = new MonitorObject(),
      item = this.monitorInfos[index];
    monitorObj.start = start;
    monitorObj.end = end;
    let monitorSuffixPath = null;
    this.chartArray[index].options.title.text = item;

    if (item === 'CPU') {
      this.chartArray[index].options = Object.assign(cpu_chart_options, {
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0]
          }
        ]});
      monitorObj.metrics = ['load_1', 'load_5', 'load_15', 'cpu_count'];
      suffix ? monitorSuffixPath = 'sdwan_ds/' + 'cpe_cpu' + suffix : monitorSuffixPath = 'sdwan/cpe_cpu';
    }else {
      this.chartArray[index].options = Object.assign(mem_chart_options, {
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0]
          }
        ]});
      monitorObj.metrics = ['used', 'free'];
      suffix ? monitorSuffixPath = 'sdwan_ds/' + 'cpe_mem' + suffix : monitorSuffixPath = 'sdwan/cpe_mem';
    }
    monitorObj.tags = {esn_id: this.esn_id};

    this.monitorService.vpeLinkMonitor(monitorSuffixPath, [monitorObj]).subscribe((datas: Array<any>) => {
      const seriesArr = [], legend = [], results = datas[0];
      if (results.dps && results.dps.length) {
        for (let j = 0; j < results.metrics.length; j++) {
          legend.push(results.metrics[j] + suffix);
          const lineData = {
            name: results.metrics[j] + suffix,
            yAxisIndex: results.metrics[j].indexOf('percent') > -1 ? 1 : 0,
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
          text: item
        }
      });
    });
  }

  visibleChange(visible: boolean) {
    if (!visible) {
      this.reset();
    }
  }
  close() {
    this.dialogOptions.visible = false;
    this.reset();
  }
}
