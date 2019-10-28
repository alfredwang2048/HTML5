import { Component, OnInit, Input } from '@angular/core';
import { CeInventory, VpeService } from '../../../shared/sdwan';
import {MonitorService, MonitorObject} from '../../../shared/monitor.service';
import { loss_rtt_chart_options, rate_chart_options, DURATION_OPTIONS } from '../../../model';
import {QueryObject} from '../../../base/api';

@Component({
  selector: 'app-cpe-mointor',
  templateUrl: './cpe-mointor.component.html',
  styleUrls: ['./cpe-mointor.component.styl']
})
export class CpeMointorComponent implements OnInit {
  @Input()
  selectedItem: CeInventory;
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
  monitorTypes = [{
    name: 'rate',
    text: '流量'
  }, {
    name: 'loss',
    text: '丢包延时'
  }];
  currentMonitorType = 'rate';
  hasPublicNetworkInfos = [];
  durationOption: any;
  constructor(private monitorService: MonitorService, private vpeService: VpeService) { }

  ngOnInit() {
    const now = new Date();
    const hourMilliSecond = 60 * 60 * 1000;
    this.rangeModel.type = 'hour';
    this.rangeModel.end = now.getTime();
    this.rangeModel.start = now.getTime() - hourMilliSecond;
  }

  open() {
    this.currentMonitorType = 'rate';
    this.dialogOptions.title = '监控详情(' + this.selectedItem.name + ')';
    this.chartArray = [];
    const now = new Date();
    this.rangeModel.type = 'hour';
    const hourMilliSecond = 60 * 60 * 1000;
    this.rangeModel.end = now.getTime();
    this.rangeModel.start = now.getTime() - hourMilliSecond;
    this.hasPublicNetworkInfos = [];
    const vpeUuids = [];
    this.selectedItem.popInfos.forEach((item) => {
      this.hasPublicNetworkInfos.push(item);
      vpeUuids.push(item.vpeUuid);
      this.chartArray.push({
        options: Object.assign(rate_chart_options, {
          dataZoom: [
            {
              type: 'inside',
              xAxisIndex: [0]
            }
          ]}),
        haType: item.haType,
        merge: null,
        isLoading: true,
        noData: false,
        timer: null,
        storageChartData: {
          data: [],
          start: 0,
          end: 0
        }
      });
    });

    this.dialogOptions.visible = true;
    const qobj = new QueryObject();
    qobj.conditions = [{name: 'uuid', op: 'in', value: vpeUuids.join(',')}];
    this.vpeService.query(qobj, (vpes) => {
      vpes.forEach((item) => {
        for (let i = 0; i < this.hasPublicNetworkInfos.length; i ++) {
          if (this.hasPublicNetworkInfos[i].vpeUuid === item.uuid) {
            this.hasPublicNetworkInfos[i].vpeManageIp = item.manageIp;
            break;
          }
        }
      });
      this.searchHandler();
    });
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
    this.hasPublicNetworkInfos.forEach((item, index) => {
        this.chartArray[index].isLoading = true;
        this.chartArray[index].noData = false;
        this.chartArray[index].storageChartData.start = this.rangeModel.start;
        this.chartArray[index].storageChartData.end = this.rangeModel.end;
        this.cellMonitor(item.lineType, this.chartArray[index].storageChartData.start, this.chartArray[index].storageChartData.end, index, (chartOptions) => {
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
              this.cellMonitor(item.lineType, this.chartArray[index].storageChartData.start, this.chartArray[index].storageChartData.end, index, (options) => {
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
  cellMonitor(lineType, start, end, index, done: (chartOptions) => void, suffix = '') {
    const monitorObj = new MonitorObject(),
      item = this.hasPublicNetworkInfos[index];
    monitorObj.start = start;
    monitorObj.end = end;
    let monitorSuffixPath = null;
    this.chartArray[index].options.title.text = item.lineName;
    if (this.currentMonitorType === 'rate') {
      this.chartArray[index].options = Object.assign(rate_chart_options, {
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0]
          }
        ]});
      monitorObj.metrics = ['in_rate', 'out_rate'];
      if (lineType === 'TUNNEL') {
        monitorObj.tags = {esn_id: this.selectedItem.esn, if_name: item.vlan ? item.nicName + '.' + item.vlan : item.nicName};
        suffix ? monitorSuffixPath = 'sdwan_ds/' + 'cpe_traffic_from_cpe' + suffix : monitorSuffixPath = 'sdwan/cpe_traffic_from_cpe';
      }else if (lineType === 'VPN') {
        monitorObj.tags = {esn_id: this.selectedItem.esn, pop_id: item.uuid};
        suffix ? monitorSuffixPath = 'sdwan_ds/' + 'cpe_traffic_from_vpe' + suffix : monitorSuffixPath = 'sdwan/cpe_traffic_from_vpe';
      }
    }else {
      this.chartArray[index].options = Object.assign(loss_rtt_chart_options, {
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0]
          }
        ]});
      monitorObj.metrics = ['loss', 'rtt', 'jitter'];

      if (lineType === 'TUNNEL') {
        monitorObj.tags = {esn_id: this.selectedItem.esn, if_name: item.vlan ? item.nicName + '.' + item.vlan : item.nicName};
        suffix ? monitorSuffixPath = 'sdwan_ds/' + 'cpe_icmp_from_cpe' + suffix : monitorSuffixPath = 'sdwan/cpe_icmp_from_cpe';
      }else if (lineType === 'VPN') {
        monitorObj.tags = {esn_id: this.selectedItem.esn, pop_id: item.uuid};
        suffix ? monitorSuffixPath = 'sdwan_ds/' + 'cpe_icmp_from_vpe' + suffix : monitorSuffixPath = 'sdwan/cpe_icmp_from_vpe';
      }
    }
    this.monitorService.vpeLinkMonitor(monitorSuffixPath, [monitorObj]).subscribe((datas: Array<any>) => {
      const seriesArr = [], legend = [], results = datas[0];
      if (results.dps && results.dps.length) {
        for (let j = 0; j < results.metrics.length; j++) {
          if (results.metrics[j].indexOf('in') > -1) {
             results.metrics[j] = results.metrics[j].replace(/in/, 'out');
          }else if (results.metrics[j].indexOf('out') > -1) {
             results.metrics[j] = results.metrics[j].replace(/out/, 'in');
          }
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
          text: item.haType === 'Master' ?
            (!this.selectedItem.masterEndpointName && !this.selectedItem.masterVpeName ? '(主/' + this.selectedItem.masterLineName + ')' : '(主)' + (this.selectedItem.masterVpeName || this.selectedItem.masterEndpointName))
            :
            (!this.selectedItem.slaveEndpointName && !this.selectedItem.slaveVpeName ? '(备/' + this.selectedItem.slaveLineName + ')' : '(备)' + (this.selectedItem.slaveVpeName || this.selectedItem.slaveEndpointName))
        }
      });
    });
  }
  clickTypeHandler(type) {
    this.currentMonitorType = type;
    this.reset();
    this.queryMonitor();
  }

  visibleChange(visible: boolean) {
    if (!visible) {
      this.reset();
    }
  }

  cancel() {
    this.dialogOptions.visible = false;
    this.reset();
  }
}
