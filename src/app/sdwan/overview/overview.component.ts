import {Component, OnDestroy, OnInit} from '@angular/core';
import {bar_chart_options, pie_chart_options} from '../../model';
import {QueryObject} from '../../base';
import {CeService} from '../../shared/sdwan/ce.service';
import {StockService} from '../../shared/sdwan/stock.service';
import {HaService, LinkMonitorService, VpeService} from '../../shared/sdwan';
import {TimeFormatting} from '../../model/utils';
import {DatePipe} from '@angular/common';
import {sizeRoundToString} from '../../model/monitor';
import {VpePublicNetworkTypePipe} from '../vpe/pipe/vpe-public-network-type.pipe';
import {Router} from '@angular/router';
import {el} from '@angular/platform-browser/testing/src/browser_util';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.styl'],
  providers: [DatePipe, VpePublicNetworkTypePipe]
})
export class OverviewComponent implements OnInit, OnDestroy {

  baseData = {
    ceNum: null,
    ceNum_master_connected: null,
    ceNum_master_disconnected: null,
    stockNum: null,
    ceOnLineNum: null,
    alarmCpeNum: null,
    alarmCpeNum_ok: null,
    vpeIpInfoNum: null,
    vpeIpInfoNum_connected: null,

    vpeNum: null,
    vpeNum_status_connected: null,

    vpeLinkMonitorNum: null,
    vpeLinkMonitorNum_status_connected: null,

    cePositionDatas: null,
    cpeAlarmDatas: [],
    publicNetworkAlarmDatas: [],
    ceFaultDatas: [],

    ceBandwidth: {total: 0, used: 0},
    popInfoDatas: [],
    popInfoUsageDatas: [],

    bandwidthStatistics: {total: 0, used: 0},
    vpepopInfoDatas: [],
    vpepopInfoUsageDatas: [],
  };
  timeModel = {
    start: null,
    end: null
  };
  timer: any;

  pieChartOptions = pie_chart_options;
  cpeOverviewOptions: any;
  cpeOnlineStateOptions: any;
  vpeLinkMonitorOptions: any;
  ceBandwidthOptions: any;
  bandwidthStatisticsOptions: any;

  barChartOptions = bar_chart_options;
  sdwanAlarmOptions = null;
  cpeStateOptions = null;

  vpeStateOptions = null;

  legend = {
    type: 'plain',
    data: []
  };
  pieData = {
    name: '',
    type: 'pie',
    startAngle: 90,
    center: ['30%', '50%'],
    radius: null,
    selectedMode: null,
    data: [],
    label: {
      normal: {
        show: false,
        position: 'center'
      },
    },
    itemStyle: {
      emphasis: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    hoverOffset: 6,
    selectedOffset: 6
  };

  isLoading = {
    cpeOverview: false,
    cpeOnlineState: false,
    vpeState: false,
    vpeLinkMonitor: false,
    ceBandwidth: false,
    bandwidthStatistics: false,
    cpeState: false,
    sdwanAlarm: false,
  };
  noData = {
    cpeOverview: true,
    cpeAlarm: true,
    ceFault: true,
    vpeState: true,
    vpeLinkMonitor: true,
    publicNetworkAlarm: true,
    popInfo: true,
    popInfoUsage: true,
    vpepopInfo: true,
    vpePopInfoUsage: true,
  };

  constructor(private ceService: CeService,
              private stockService: StockService,
              private haService: HaService,
              private vpeService: VpeService,
              private monitorService: LinkMonitorService,
              private datePipe: DatePipe,
              private vpePublicNetworkTypePipe: VpePublicNetworkTypePipe,
              private router: Router) {
  }

  ngOnInit() {
    this.reset();
    // this.queryData();
    this.timer = setInterval(()=>{
      this.queryData();
    }, 120 * 1000)
  }
  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
  reset(){
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.queryData();
  }

  queryData(){
    // ce
    const qobj_ce = new QueryObject();
    qobj_ce.count = true;
    this.queryCe(qobj_ce, 'cpe');

    // ce 启用 master 正常
    const qobj_ce_master_connected = new QueryObject();
    qobj_ce_master_connected.count = true;
    qobj_ce_master_connected.conditions = [
      {name: 'state', op: '=', value: 'Enabled'},
      {name: 'popInfos.haType', op: '=', value: 'Master'},
      {name: 'popInfos.status', op: '=', value: 'Connected'}
    ];
    this.queryCe(qobj_ce_master_connected, 'popInfos_master_connected');

    // ce 启用 master 异常
    const qobj_ce_master_disconnected = new QueryObject();
    qobj_ce_master_disconnected.count = true;
    qobj_ce_master_disconnected.conditions = [
      {name: 'state', op: '=', value: 'Enabled'},
      {name: 'popInfos.haType', op: '=', value: 'Master'},
      {name: 'popInfos.status', op: '=', value: 'Disconnected'}
    ];
    this.queryCe(qobj_ce_master_disconnected, 'popInfos_master_disconnected');

    //获取当前一天时间段
    this.getDayTime();

    // cpe告警
    const qobj_alarmCpe = new QueryObject();
    qobj_alarmCpe.count = true;
    qobj_alarmCpe.conditions = [
      {name: 'productType', op: '=', value: 'SDWAN'},
      {name: 'alarmTime', op: '>=', value: this.timeModel.start},
      {name: 'alarmTime', op: '<', value: this.timeModel.end}
    ];
    this.queryAlarmCpe(qobj_alarmCpe, 'SDWAN_all', true);

    // cpe告警 已恢复
    const qobj_alarmCpe_ok = new QueryObject();
    qobj_alarmCpe_ok.count = true;
    qobj_alarmCpe_ok.conditions = [
      {name: 'productType', op: '=', value: 'SDWAN'},
      {name: 'alarmTime', op: '>=', value: this.timeModel.start},
      {name: 'alarmTime', op: '<', value: this.timeModel.end},
      {name: 'status', op: '=', value: 'OK'}
    ];
    this.queryAlarmCpe(qobj_alarmCpe_ok, 'status_ok', true);

    // VPE
    const qobj_vpe = new QueryObject();
    qobj_vpe.count = true;
    this.queryVpe(qobj_vpe, 'all');

    // VPE 已连接
    const qobj_vpe_statusConnected = new QueryObject();
    qobj_vpe_statusConnected.count = true;
    qobj_vpe_statusConnected.conditions = [{name: 'status', op: '=', value: 'Connected'}];
    this.queryVpe(qobj_vpe_statusConnected, 'vpe_status_connected');

    // VPE公网监控
    const qobj_vpeIpInfo = new QueryObject();
    qobj_vpeIpInfo.count = true;
    this.queryVpeIpInfo(qobj_vpeIpInfo, 'all');

    // VPE公网监控 状态-正常
    const qobj_vpeIpInfo_connected = new QueryObject();
    qobj_vpeIpInfo_connected.count = true;
    qobj_vpeIpInfo_connected.conditions = [{name: 'status', op: '=', value: 'Connected'}];
    this.queryVpeIpInfo(qobj_vpeIpInfo_connected, 'connected');


    // 公网链路
    const qobj_VpnLinkMonitor = new QueryObject();
    qobj_VpnLinkMonitor.count = true;
    this.queryVpnLinkMonitor(qobj_VpnLinkMonitor, 'all');

    // 公网链路 状态-正常
    const qobj_VpnLinkMonitor_status_connected = new QueryObject();
    qobj_VpnLinkMonitor_status_connected.count = true;
    qobj_VpnLinkMonitor_status_connected.conditions = [{name: 'status', op: '=', value: 'Connected'}];
    this.queryVpnLinkMonitor(qobj_VpnLinkMonitor_status_connected, 'vpeLinkMonitor_status_connected');

    // 最新告警 sdwan
    const qobj_alarm = new QueryObject();
    qobj_alarm.start = 0;
    qobj_alarm.limit = 5;
    qobj_alarm.fields = ['uuid', 'productUuid', 'alarmContent', 'alarmTime', 'resumeTime', 'status'];
    qobj_alarm.conditions = [{name: 'productType', op: '=', value: 'SDWAN'}];
    this.queryAlarmCpe(qobj_alarm, 'all', false);

    // 公网IP
    const qobj_publicNetwork = new QueryObject();
    qobj_publicNetwork.start = 0;
    qobj_publicNetwork.limit = 5;
    qobj_publicNetwork.fields = ['uuid', 'productUuid', 'alarmContent', 'alarmTime', 'resumeTime', 'status'];
    qobj_publicNetwork.conditions = [
      {name: "productType", op: "=", value: "SDWANPUBLICNETWORK"}
    ];
    this.queryAlarmCpe(qobj_publicNetwork, 'publicNetwork', false, true);

    // 最近故障CPE
    this.getCeFault(5);

    // CPE已售带宽
    this.getCeBandwidth();

    // 已用带宽 TOP5
    const qobj_popInfo = new QueryObject();
    qobj_popInfo.start = 0;
    qobj_popInfo.limit = 5;
    qobj_popInfo.sortDirection = 'desc';
    qobj_popInfo.sortBy = 'bandwidth';
    qobj_popInfo.fields = ['uuid', 'ceUuid', 'bandwidth'];
    qobj_popInfo.conditions = [{name: 'haType', op: '=', value: 'Master'}];
    this.queryPopInfo(qobj_popInfo, 'bandwidth');

    // 带宽使用率 TOP5
    const qobj_popInfo_usage = new QueryObject();
    qobj_popInfo_usage.start = 0;
    qobj_popInfo_usage.limit = 5;
    qobj_popInfo_usage.sortDirection = 'desc';
    qobj_popInfo_usage.sortBy = 'bandwidthUsage';
    qobj_popInfo_usage.fields = ['uuid', 'ceUuid', 'bandwidth', 'bandwidthUsage'];
    qobj_popInfo_usage.conditions = [{name: 'haType', op: '=', value: 'Master'}];
    this.queryPopInfo(qobj_popInfo_usage, 'bandwidthUsage');

    // 公网带宽
    this.getBandwidthStatistics();

    // 已用带宽 TOP5
    const qobj_vpepopInfo = new QueryObject();
    qobj_vpepopInfo.start = 0;
    qobj_vpepopInfo.limit = 5;
    qobj_vpepopInfo.sortDirection = 'desc';
    qobj_vpepopInfo.sortBy = 'usedBandwidth';
    qobj_vpepopInfo.fields = ['uuid', 'vpeUuid', 'usedBandwidth', 'publicIp', 'type'];
    this.queryVpeIpInfo_all(qobj_vpepopInfo, 'usedBandwidth');

    // 带宽使用率 TOP5
    const qobj_vpepopInfo_usage = new QueryObject();
    qobj_vpepopInfo_usage.start = 0;
    qobj_vpepopInfo_usage.limit = 5;
    qobj_vpepopInfo_usage.sortDirection = 'desc';
    qobj_vpepopInfo_usage.sortBy = 'bandwidthUsage';
    qobj_vpepopInfo_usage.fields = ['uuid', 'vpeUuid', 'usedBandwidth', 'publicIp', 'type', 'bandwidthUsage'];
    this.queryVpeIpInfo_all(qobj_vpepopInfo_usage, 'bandwidthUsage');
  }

  // ce
  queryCe(qobj, type?) {
    if (type == 'cpe') {
      this.isLoading.cpeOverview = this.isLoading.cpeOnlineState = true;
      this.noData.cpeOverview = false;
    }else if(type == 'popInfos_master_connected' || type == 'popInfos_master_disconnected'){
      this.isLoading.cpeState = true;
    }
    const sub = this.ceService.query(qobj, (datas, total: number) => {
      if (type == 'cpe') {
        this.baseData.ceNum = total;
        this.queryStock();
      } else if (type == 'popInfos_master_connected') {
        this.baseData.ceNum_master_connected = total;
      } else if (type == 'popInfos_master_disconnected') {
        this.baseData.ceNum_master_disconnected = total;
      }

      if (this.baseData.ceNum != null &&
          this.baseData.ceNum_master_connected != null &&
          this.baseData.ceNum_master_disconnected != null) {

        this.isLoading.cpeState = false;
        this.cpeStateMonitor();
      }
    }, true);
  }

  queryStock() {
    const qobj = new QueryObject();
    qobj.count = true;
    const sub = this.stockService.query(qobj, (datas, total: number) => {
      this.baseData.stockNum = total;
      this.isLoading.cpeOverview = false;
      this.noData.cpeOverview = this.baseData.ceNum == 0 && this.baseData.stockNum == 0;

      this.cpeMonitor();
      this.queryCeFrpStatus();
    }, true);
  }

  // CPE总览
  cpeMonitor() {
    const legend = Object.assign({}, this.legend);
    legend.data = [{name: '已分配'}, {name: '未分配'}];
    let graphic = [
      {type: 'text', bottom: 50, right: 25, style: {text: this.baseData.ceNum + '台'}},
      {type: 'text', bottom: 25, right: 25, style: {text: this.baseData.stockNum + '台'}},
    ];
    const pieDatas:any = Object.assign({}, this.pieData);
    pieDatas.name = 'CPE总览';
    pieDatas.radius = ['40%', '70%'];
    pieDatas.data = [
      {
        name: '已分配', value: this.baseData.ceNum,
        url: '/sdwan/cpe'
      },
      {
        name: '未分配', value: this.baseData.stockNum,
        url: '/sdwan/stock'
      },
    ];
    pieDatas.label.normal.show = false;

    let colors = ['#5cb85c', '#ddd'];
    let tooltip:any = {};

    if(this.baseData.ceNum==0&&this.baseData.stockNum==0){
      tooltip.show = false;
      legend.data = [{name: 'CPE'}];
      graphic = [
        {type: 'text', bottom: 25, right: 25, style: {text: '0台'}}
      ];
      colors = ['#ddd'];

      pieDatas.hoverAnimation = false;
      pieDatas.legendHoverLink = false;
      pieDatas.hoverOffset = 0;
      pieDatas.selectedOffset = 0;
      pieDatas.data = [
        {
          name: 'CPE', value: 0,
          url: '/sdwan/cpe'
        }
      ];
    }

    this.cpeOverviewOptions = {
      tooltip: tooltip,
      color: colors,
      legend: legend,
      graphic: graphic,
      series: pieDatas,
      title: {
        text: this.baseData.ceNum + this.baseData.stockNum,
        textStyle: {
          fontSize: 30,
        },
        subtext: 'CPE(台)',
        subtextStyle: {
          color: '#000',
          fontSize: 12,
        },
        textAlign: 'center',
        left: '29%',
        top: '35%'
      }
    };
  }

  queryCeFrpStatus() {
    const qobj = new QueryObject();
    qobj.count = true;
    qobj.conditions = [{name: 'status', op: '=', value: 'online'}];
    const sub = this.ceService.query(qobj, (datas, total: number) => {
      this.baseData.ceOnLineNum = total;

      this.isLoading.cpeOnlineState = false;
      this.cpeOnLineMonitor();
    }, true);
  }

  // CPE分析
  cpeOnLineMonitor() {
    const legend = Object.assign({}, this.legend);
    legend.data = [{name: '在线'}, {name: '离线'}];

    const ceDownlineNum = this.baseData.ceNum - this.baseData.ceOnLineNum;
    let graphic = [
      {type: 'text', bottom: 50, right: 25, style: {text: this.baseData.ceOnLineNum + '台'}},
      {type: 'text', bottom: 25, right: 25, style: {text: ceDownlineNum + '台'}},
    ];

    const pieData:any = Object.assign({}, this.pieData);
    pieData.name = 'CPE分析';
    pieData.radius = ['40%', '70%'];
    pieData.selectedMode = 'single';
    pieData.data = [
      {
        name: '在线', value: this.baseData.ceOnLineNum,
        url: '/sdwan/cpe?name=status&value=online'
      },
      {
        name: '离线', value: ceDownlineNum,
        url: '/sdwan/cpe?name=status&value=offline'
      },
    ];
    pieData.label.normal.show = false;

    let colors = ['#5cb85c', '#c23531'];
    let tooltip:any = {};

    if(this.baseData.ceNum === 0){
      tooltip.show = false;
      legend.data = [{name: 'CPE'}];
      graphic = [
        {type: 'text', bottom: 25, right: 25, style: {text: '0台'}}
      ];
      colors = ['#ddd'];

      pieData.hoverAnimation = false;
      pieData.legendHoverLink = false;
      pieData.hoverOffset = 0;
      pieData.selectedOffset = 0;
      pieData.data = [
        {name: 'CPE', value: 0, url: '/sdwan/cpe'}
      ];
    }

    this.cpeOnlineStateOptions = {
      tooltip: tooltip,
      color: colors,
      series: pieData,
      legend: legend,
      graphic: graphic,
      title: {
        text: this.baseData.ceNum,
        textStyle: {
          fontSize: 30,
        },
        subtext: 'CPE(台)',
        subtextStyle: {
          color: '#000',
          fontSize: 12,
        },
        textAlign: 'center',
        left: '29%',
        top: '35%'
      }
    };
  }

  queryAlarmCpe(qobj, type, onlyCount, searchPublicNetwork?) {
     if (type == 'all') {
      this.noData.cpeAlarm = false;
    } else if (type == 'publicNetwork') {
      this.noData.publicNetworkAlarm = false;
    }else if(type == 'SDWAN_all' || type == 'status_ok'){
       this.isLoading.sdwanAlarm = true
     }

    const sub = this.haService.queryAlarm(qobj, (datas, total: number) => {
      if (type == 'SDWAN_all') {
        this.baseData.alarmCpeNum = total;
      } else if (type == 'status_ok') {
        this.baseData.alarmCpeNum_ok = total;
      } else if (type == 'all') {
        if (total > 0) {
          this.baseData.cpeAlarmDatas = datas;
          this.baseData.cpeAlarmDatas.map(item=>{
              item.times = '报警时间：'+ this.datePipe.transform(item.alarmTime, 'yyyy-MM-dd HH:mm:ss');
              if(item.status==='OK'){
                item.times += '<br/>恢复时间：'+ this.datePipe.transform(item.resumeTime, 'yyyy-MM-dd HH:mm:ss');
              }
            }
          );
        } else {
          this.noData.cpeAlarm = true;
        }
      }else if(type == 'publicNetwork'){
        if (total > 0) {
          this.baseData.publicNetworkAlarmDatas = datas;
          this.baseData.publicNetworkAlarmDatas.map(item=>{
              item.times = '报警时间：'+ this.datePipe.transform(item.alarmTime, 'yyyy-MM-dd HH:mm:ss');
              if(item.status==='OK'){
                item.times += '<br/>恢复时间：'+ this.datePipe.transform(item.resumeTime, 'yyyy-MM-dd HH:mm:ss');
              }
            }
          );
        } else {
          this.baseData.publicNetworkAlarmDatas = [];
          this.noData.publicNetworkAlarm = true;
        }
      }
      if (this.baseData.alarmCpeNum != null && this.baseData.alarmCpeNum_ok != null) {
        this.isLoading.sdwanAlarm = false
        this.sdwanAlarmMonitor();
      }
    }, onlyCount, searchPublicNetwork);
  }

  // CPE状态
  cpeStateMonitor(){
    const legend = Object.assign({}, this.legend);
    legend.data = [{name: '正常'}, {name: '异常'}, {name: '未启用'}];

    let notEnabledNum = this.baseData.ceNum - this.baseData.ceNum_master_connected - this.baseData.ceNum_master_disconnected;

    let graphic = [
      {type: 'text', bottom: 75, right: 25, style: {text: this.baseData.ceNum_master_connected + '台'}},
      {type: 'text', bottom: 50, right: 25, style: {text: this.baseData.ceNum_master_disconnected + '台'}},
      {type: 'text', bottom: 25, right: 25, style: {text: notEnabledNum + '台'}},
    ];

    const pieData:any = Object.assign({}, this.pieData);
    pieData.name = 'CPE状态';
    pieData.radius = ['40%', '70%'];
    pieData.selectedMode = 'single';
    pieData.data = [
      {
        name: '正常', value: this.baseData.ceNum_master_connected,
        url: '/sdwan/cpe?name=state&value=Enabled&otherName=masterStatus&otherValue=Connected'
      }, {
        name: '异常', value: this.baseData.ceNum_master_disconnected,
        url: '/sdwan/cpe?name=state&value=Enabled&otherName=masterStatus&otherValue=Disconnected'
      }, {
        name: '未启用', value: notEnabledNum,
        url: '/sdwan/cpe?name=state&value=Disabled'
      },
    ];
    pieData.label.normal.show = false;

    let colors = ['#5cb85c', '#c23531', '#ddd'];
    let tooltip:any = {};

    if(this.baseData.ceNum === 0){
      tooltip.show = false;
      legend.data = [{name: 'CPE'}];
      graphic = [
        {type: 'text', bottom: 25, right: 25, style: {text: '0台'}}
      ];
      colors = ['#ddd'];

      pieData.hoverAnimation = false;
      pieData.legendHoverLink = false;
      pieData.hoverOffset = 0;
      pieData.selectedOffset = 0;
      pieData.data = [
        {name: 'CPE', value: 0, url: '/sdwan/cpe'}
      ];
    }

    this.cpeStateOptions = {
      tooltip: tooltip,
      color: colors,
      series: pieData,
      legend: legend,
      graphic: graphic,
      title: {
        text: this.baseData.ceNum,
        textStyle: {
          fontSize: 30,
        },
        subtext: 'CPE状态',
        subtextStyle: {
          color: '#000',
          fontSize: 12,
        },
        textAlign: 'center',
        left: '29%',
        top: '35%'
      }
    };
  }

  // 24小时告警
  sdwanAlarmMonitor(){
    const legend = Object.assign({}, this.legend);
    legend.data = [{name: '已恢复'}, {name: '未恢复'}];

    const alarmCpeNum_not = this.baseData.alarmCpeNum - this.baseData.alarmCpeNum_ok;
    let graphic = [
      {type: 'text', bottom: 50, right: 25, style: {text: this.baseData.alarmCpeNum_ok + '条'}},
      {type: 'text', bottom: 25, right: 25, style: {text: alarmCpeNum_not + '条'}},
    ];

    const pieData:any = Object.assign({}, this.pieData);
    pieData.name = 'CPE报警';
    pieData.radius = ['40%', '70%'];
    pieData.selectedMode = 'single';
    pieData.data = [
      {
        name: '已恢复', value: this.baseData.alarmCpeNum_ok,
        url: '/boss/alarm/#/alarm/history?productType=SDWAN',
        otherProject: true
      },
      {
        name: '未恢复', value: alarmCpeNum_not,
        url: '/boss/alarm/#/alarm/history?productType=SDWAN',
        otherProject: true
      },
    ];
    pieData.label.normal.show = false;

    let colors = ['#5cb85c', '#c23531'];
    let tooltip:any = {
      trigger: 'item',
      formatter: "{a} <br/>{b} : {c}条 ({d}%)",
      textStyle: {
        fontSize: 12,
      }
    };

    if(this.baseData.alarmCpeNum === 0){
      tooltip.show = false;
      legend.data = [{name: '告警数量'}];
      graphic = [
        {type: 'text', bottom: 25, right: 25, style: {text: '0条'}}
      ];
      colors = ['#ddd'];

      pieData.hoverAnimation = false;
      pieData.legendHoverLink = false;
      pieData.hoverOffset = 0;
      pieData.selectedOffset = 0;
      pieData.data = [
        {name: '告警数量', value: 0, url: '/boss/alarm/#/alarm/history?productType=SDWAN', otherProject: true}
      ];
    }

    this.sdwanAlarmOptions = {
      tooltip: tooltip,
      color: colors,
      series: pieData,
      legend: legend,
      graphic: graphic,
      title: {
        text: this.baseData.alarmCpeNum,
        textStyle: {
          fontSize: 30,
        },
        subtext: '告警数',
        subtextStyle: {
          color: '#000',
          fontSize: 12,
        },
        textAlign: 'center',
        left: '29%',
        top: '35%'
      }
    };
  }

  queryVpe(qobj, type?) {
    this.isLoading.vpeState = true;
    this.noData.vpeState = false;
    const sub = this.vpeService.query(qobj, (datas, total) => {
      sub.unsubscribe();
      if (type == 'all') {
        this.baseData.vpeNum = total;
      } else if (type == 'vpe_status_connected') {
        this.baseData.vpeNum_status_connected = total;
      }
      this.vpeMonitor();
    }, false, true);
  }

  queryVpeIpInfo(qobj, type?) {
    this.isLoading.vpeState = true;
    this.noData.vpeState = false;
    const sub = this.vpeService.queryVpeIpInfo(qobj, (datas, total) => {
      sub.unsubscribe();
      if (type == 'all') {
        this.baseData.vpeIpInfoNum = total;
      } else if (type == 'connected') {
        this.baseData.vpeIpInfoNum_connected = total;
      }
      this.vpeMonitor();
    }, false, true);
  }

  // vpe/IP状态
  vpeMonitor() {
    if (this.baseData.vpeNum == null
      || this.baseData.vpeNum_status_connected == null
      || this.baseData.vpeIpInfoNum == null
      || this.baseData.vpeIpInfoNum_connected == null) {
      return;
    }

    this.isLoading.vpeState = false;
    if (this.baseData.vpeNum == 0 && this.baseData.vpeIpInfoNum == 0) {
      this.noData.vpeState = true;
    }

    const vpeDisconnectedNum = this.baseData.vpeNum - this.baseData.vpeNum_status_connected;
    const vpeIpInfoDisconnectedNum = this.baseData.vpeIpInfoNum - this.baseData.vpeIpInfoNum_connected;

    function isZero(datas?) {
      if (datas.value[1] == 0) return '';
    }

    this.vpeStateOptions = {
      series: [
        {
          name: '正常',
          type: 'bar',
          barWidth: 50,
          stack: '总量',
          label: {
            show: true,
            position: 'inside',
            formatter: function (datas) {
              return isZero(datas);
            }
          },
          data: [
            // ['VPE状态', this.baseData.vpeNum_status_connected]
            {value: ['VPE状态', this.baseData.vpeNum_status_connected], url: '/sdwan/vpe'}
          ],
          // itemStyle: {
          //   color: '#5cb85c'
          // }
        },
        {
          name: '异常',
          type: 'bar',
          barWidth: 50,
          stack: '总量',
          label: {
            show: true,
            position: 'inside',
            formatter: function (datas) {
              return isZero(datas);
            }
          },
          data: [
            // ['VPE状态', vpeDisconnectedNum]
            {value: ['VPE状态', vpeDisconnectedNum], url: '/sdwan/vpe'}
          ]
        },
        {
          name: '正常',
          type: 'bar',
          barWidth: 50,
          label: {
            show: true,
            position: 'inside',
            formatter: function (datas) {
              return isZero(datas);
            }
          },
          stack: '总量',
          data: [
            // ['公网状态', this.baseData.vpeIpInfoNum_connected]
            {value: ['公网状态', this.baseData.vpeIpInfoNum_connected], url: '/sdwan/publicNetworkMonitor?name=status&value=Connected'}
          ]
        },
        {
          name: '异常',
          type: 'bar',
          barWidth: 50,
          label: {
            show: true,
            position: 'inside',
            formatter: function (datas) {
              return isZero(datas);
            }
          },
          stack: '总量',
          data: [
            // ['公网状态', vpeIpInfoDisconnectedNum]
            {value: ['公网状态', vpeIpInfoDisconnectedNum], url: '/sdwan/publicNetworkMonitor?name=status&value=Disconnected'}
          ]
        }
      ],
      legend: {
        data: ['正常', '异常']
      },
      xAxis: {
        type: 'category',
        data: ['VPE状态', '公网状态']
      },
      yAxis: {
        type: 'value',
        splitNumber: 2
      }
    };
  }

  queryVpnLinkMonitor(qobj, type?) {
    this.isLoading.vpeLinkMonitor = true;
    this.noData.vpeLinkMonitor = false;
    const sub = this.monitorService.query(qobj, (datas, total) => {
      sub.unsubscribe();
      if (type == 'all') {
        this.baseData.vpeLinkMonitorNum = total;
      } else if (type == 'vpeLinkMonitor_status_connected') {
        this.baseData.vpeLinkMonitorNum_status_connected = total;
      }
      this.isLoading.vpeLinkMonitor = false;
      this.noData.vpeLinkMonitor = this.baseData.vpeLinkMonitorNum == 0;
      if (this.baseData.vpeLinkMonitorNum != null && this.baseData.vpeLinkMonitorNum_status_connected != null) {
        this.vpnLinkMonitor();
      }
    }, true);
  }

  // 公网链路
  vpnLinkMonitor() {
    const legend = Object.assign({}, this.legend);
    legend.data = [{name: '正常'}, {name: '异常'}];
    const vpeLinkMonitorNum_status_disconnected = this.baseData.vpeLinkMonitorNum - this.baseData.vpeLinkMonitorNum_status_connected;
    let graphic = [
      {type: 'text', bottom: 50, right: 25, style: {text: this.baseData.vpeLinkMonitorNum_status_connected + '条'}},
      {type: 'text', bottom: 25, right: 25, style: {text: vpeLinkMonitorNum_status_disconnected + '条'}},
    ];

    const pieData:any = Object.assign({}, this.pieData);
    pieData.name = '公网链路';
    pieData.radius = ['40%', '70%'];
    pieData.selectedMode = 'single';
    pieData.data = [
      {name: '正常', value: this.baseData.vpeLinkMonitorNum_status_connected, url: '/sdwan/linkMonitor?name=status&value=Connected'},
      {name: '异常', value: vpeLinkMonitorNum_status_disconnected, url: '/sdwan/linkMonitor?name=status&value=Disconnected'},
    ];
    pieData.label.normal.show = false;
    // pieData.label = {
    //   show: true,
    //   formatter: function (datas) {
    //     return datas.name + '\n' + Math.round(datas.percent) + '%';
    //   }
    // };

    let colors = ['#5cb85c', '#c23531'];
    let tooltip:any = {};

    if(this.baseData.vpeLinkMonitorNum === 0) {
      tooltip.show = false;
      legend.data = [{name: 'VPE-PE链路'}];
      graphic = [
        {type: 'text', bottom: 25, right: 25, style: {text: '0条'}}
      ];
      colors = ['#ddd'];

      pieData.hoverAnimation = false;
      pieData.legendHoverLink = false;
      pieData.hoverOffset = 0;
      pieData.selectedOffset = 0;
      pieData.data = [
        {name: 'VPE-PE链路', value: 0, url:'/sdwan/linkMonitor'}
      ];
    }

    this.vpeLinkMonitorOptions = {
      tooltip: tooltip,
      color: colors,
      series: pieData,
      legend: legend,
      graphic: graphic,
      title: {
        text: this.baseData.vpeLinkMonitorNum,
        textStyle: {
          fontSize: 30,
        },
        subtext: '(条)',
        subtextStyle: {
          color: '#000',
          fontSize: 12,
        },
        textAlign: 'center',
        left: '29%',
        top: '35%'
      }
    };
  }

  // 最近故障CPE
  getCeFault(limit) {
    const limits = limit?limit:5;
    this.noData.ceFault = false;
    this.haService.getCeFault(limits, (datas)=>{
      if(datas.length>0){
        this.noData.ceFault = false;
        this.baseData.ceFaultDatas = datas;
      }else {
        this.noData.ceFault = true;
        this.baseData.ceFaultDatas = [];
      }
    })
  };

  // CPE已售带宽
  getCeBandwidth(){
    this.isLoading.ceBandwidth = true;
    const sub = this.ceService.getCeBandwidthStatistics((ret)=>{
      this.isLoading.ceBandwidth = false;
      this.baseData.ceBandwidth = ret;
      this.ceBandwidthMonitor();
    })
  }
  ceBandwidthMonitor(){
    let legend = Object.assign({}, this.legend);
    legend.data = [{name: '已使用'}, {name: '未使用'}];
    let unused = this.baseData.ceBandwidth.total - this.baseData.ceBandwidth.used;
    let graphic = [
      {type: 'text', bottom: 50, right: 10, style: {text: sizeRoundToString(this.baseData.ceBandwidth.used)}},
      {type: 'text', bottom: 25, right: 10, style: {text: sizeRoundToString(unused)}},
    ];
    const pieDatas:any = Object.assign({}, this.pieData);
    pieDatas.name = 'CPE带宽';
    pieDatas.radius = ['40%', '70%'];
    pieDatas.data = [
      {
        name: '已使用', value: (this.baseData.ceBandwidth.used / 1024 / 1024).toFixed(2),
        url: '/sdwan/cpe'
      },
      {
        name: '未使用', value: (unused / 1024 / 1024).toFixed(2),
        url: '/sdwan/cpe'
      },
    ];
    pieDatas.label.normal.show = false;

    let colors = ['#5cb85c', '#ddd'];
    let tooltip:any = {
      formatter: '{a} <br/>{b} : {c}M ({d}%)',
    };

    if(this.baseData.ceBandwidth.total==0){
      tooltip.show = false;
      legend.data = [{name: 'CPE'}];
      graphic = [
        {type: 'text', bottom: 25, right: 10, style: {text: '0M'}}
      ];
      colors = ['#ddd'];

      pieDatas.hoverAnimation = false;
      pieDatas.legendHoverLink = false;
      pieDatas.hoverOffset = 0;
      pieDatas.selectedOffset = 0;
      pieDatas.data = [
        {
          name: 'CPE', value: 0,
          url: '/sdwan/cpe'
        }
      ];
    }

    this.ceBandwidthOptions = {
      tooltip: tooltip,
      color: colors,
      legend: legend,
      graphic: graphic,
      series: pieDatas,
      title: {
        text: sizeRoundToString(this.baseData.ceBandwidth.total, 0),
        textStyle: {
          fontSize: 20,
        },
        subtext: '已售带宽',
        subtextStyle: {
          color: '#000',
          fontSize: 12,
        },
        textAlign: 'center',
        left: '29%',
        top: '35%'
      }
    };
  }

  // CPE带宽 已用带宽、带宽使用率
  queryPopInfo(qobj, type) {
    if (type == 'bandwidth') {
      this.noData.popInfo = false;
    } else if (type == 'bandwidthUsage') {
      this.noData.popInfoUsage = false;
    }
    const sub = this.ceService.queryPopInfo(qobj, (datas, total) => {
        if (total == 0) {
          if (type == 'bandwidth') {
            this.noData.popInfo = true;
          } else if (type == 'bandwidthUsage') {
            this.noData.popInfoUsage = true;
          }
        }
        datas.forEach((item:any)=>{
          item.bandwidth = sizeRoundToString(item.bandwidth)
        });
        if (type == 'bandwidth') {
          this.baseData.popInfoDatas = datas;
        } else if (type == 'bandwidthUsage') {
          this.baseData.popInfoUsageDatas = datas;
        }
      }
      , true);
  }

  // vpe公网带宽
  getBandwidthStatistics(){
    this.isLoading.bandwidthStatistics = true;
    const sub = this.vpeService.getCeBandwidthStatistics((ret: any) => {
      this.isLoading.bandwidthStatistics = false;
      this.baseData.bandwidthStatistics = ret;
      this.bandwidthStatisticsMonitor();
    })
  }
  bandwidthStatisticsMonitor(){
    let legend = Object.assign({}, this.legend);
    legend.data = [{name: '已使用'}, {name: '未使用'}];

    let unused = this.baseData.bandwidthStatistics.total - this.baseData.bandwidthStatistics.used;
    let graphic = [
      {type: 'text', bottom: 50, right: 10, style: {text: sizeRoundToString(this.baseData.bandwidthStatistics.used)}},
      {type: 'text', bottom: 25, right: 10, style: {text: sizeRoundToString(unused)}},
    ];
    const pieDatas:any = Object.assign({}, this.pieData);
    pieDatas.name = '公网带宽';
    pieDatas.radius = ['40%', '70%'];
    pieDatas.data = [
      {
        name: '已使用', value: (this.baseData.bandwidthStatistics.used / 1024 / 1024).toFixed(2),
        url: '/sdwan/publicNetworkMonitor'
      },
      {
        name: '未使用', value: (unused / 1024 / 1024).toFixed(2),
        url: '/sdwan/publicNetworkMonitor'
      },
    ];
    pieDatas.label.normal.show = false;

    let colors = ['#5cb85c', '#ddd'];
    let tooltip:any = {
      formatter: '{a} <br/>{b} : {c}M ({d}%)',
    };

    if(this.baseData.bandwidthStatistics.total==0){
      tooltip.show = false;
      legend.data = [{name: 'CPE'}];
      graphic = [
        {type: 'text', bottom: 25, right: 10, style: {text: '0M'}}
      ];
      colors = ['#ddd'];

      pieDatas.hoverAnimation = false;
      pieDatas.legendHoverLink = false;
      pieDatas.hoverOffset = 0;
      pieDatas.selectedOffset = 0;
      pieDatas.data = [
        {
          name: 'CPE', value: 0,
          url: '/sdwan/publicNetworkMonitor'
        }
      ];
    }

    this.bandwidthStatisticsOptions = {
      tooltip: tooltip,
      color: colors,
      legend: legend,
      graphic: graphic,
      series: pieDatas,
      title: {
        text: sizeRoundToString(this.baseData.bandwidthStatistics.total, 0),
        textStyle: {
          fontSize: 20,
        },
        subtext: '公网带宽',
        subtextStyle: {
          color: '#000',
          fontSize: 12,
        },
        textAlign: 'center',
        left: '29%',
        top: '35%'
      }
    };

  }

  // 公网带宽 已用线路、线路使用率
  queryVpeIpInfo_all(qobj, type) {
    if (type == 'usedBandwidth') {
      this.noData.vpepopInfo = false;
    } else if (type == 'bandwidthUsage') {
      this.noData.vpePopInfoUsage = false;
    }
    const sub = this.vpeService.queryVpeIpInfo(qobj, (datas, total) => {
      if (total == 0) {
        if (type == 'usedBandwidth') {
          this.noData.vpepopInfo = true;
        } else if (type == 'bandwidthUsage') {
          this.noData.vpePopInfoUsage = true;
        }
      }
      datas.forEach((item: any) => {
        item.usedBandwidth = sizeRoundToString(item.usedBandwidth);
        item.publicIpTips = item.publicIp +'&nbsp;('+  this.vpePublicNetworkTypePipe.transform(item.type) +')';
      });
      if (type == 'usedBandwidth') {
        this.baseData.vpepopInfoDatas = datas;
      } else if (type == 'bandwidthUsage') {
        this.baseData.vpepopInfoUsageDatas = datas;
      }
    }
    , true);
  }

  getDayTime() {
    const now = new Date().getTime();
    this.timeModel.end = TimeFormatting(now);
    this.timeModel.start = TimeFormatting(now - 24 * 60 * 60 * 1000);
  }

  pieChartClick(ev){
    if (ev.data.otherProject) {
      window.location.href = ev.data.url
    } else {
      setTimeout(() => {
        this.router.navigateByUrl(ev.data.url);
      }, 0);
    }
  }

}
