import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
  SimpleChanges
} from '@angular/core';
import {CeInventory, FirewallInventory, VpeService} from '../../../shared/sdwan';
import {TunnelService} from '../../../shared/tunnel';
import {QueryObject} from '../../../base';
import {SingleMointorComponent} from '../single-mointor/single-mointor.component';
import {
  arrayUpdateItem,
  chooseOtherFromAll,
  ConnectionMode,
  timeStampRoundToString
} from '../../../model/utils';
import {PageSize} from '../../../model';
import {CeService} from '../../../shared/sdwan/ce.service';
import {LoadingWindowComponent} from '../../../m-common/loading-window/loading-window.component';
import {CeUpdateComponent} from '../ce-update/ce-update.component';
import {CeUpdateWanComponent} from '../ce-update-wan/ce-update-wan.component';
import {CeUpdateLanComponent} from '../ce-update-lan/ce-update-lan.component';
import {CeUpdateBandwidthComponent} from '../ce-update-bandwidth/ce-update-bandwidth.component';
import {CeUpdateVpnTypeComponent} from '../ce-update-vpn-type/ce-update-vpn-type.component';
import {CeUpdateLineComponent} from '../ce-update-line/ce-update-line.component';
import {CeUpdateConnectionModeComponent} from '../ce-update-connection-mode/ce-update-connection-mode.component';
import {BatchServiceCidrListComponent} from '../batch-service-cidr-list/batch-service-cidr-list.component';
import {BatchRouteListComponent} from '../batch-route-list/batch-route-list.component';
import {BatchTargetCidrListComponent} from '../batch-target-cidr-list/batch-target-cidr-list.component';
import {CommonWindowComponent} from '../../../m-common/common-window/common-window.component';
import {FirewallListComponent} from '../firewall-list/firewall-list.component';
import {QosListComponent} from '../qos-list/qos-list.component';
import {CpeUpdateAgentVersionComponent} from '../cpe-update-agent-version/cpe-update-agent-version.component';
import {QosBandwidthComponent} from '../qos-bandwidth/qos-bandwidth.component';
import {CeAddApplicationLinkComponent} from '../ce-add-application-link/ce-add-application-link.component';
import {CeApplicationLinkDetailListComponent} from '../ce-application-link-detail-list/ce-application-link-detail-list.component';
import {CeUpdateApplicationLinkComponent} from '../ce-update-application-link/ce-update-application-link.component';
import {CeDhcpLeaseComponent} from '../ce-dhcp-lease/ce-dhcp-lease.component';
import {AppMointorComponent} from '../app-mointor/app-mointor.component';
import {SystemMointorComponent} from '../system-mointor/system-mointor.component';
import {CeUpdateOspfComponent} from '../ce-update-ospf/ce-update-ospf.component';
import {CeUpdateBfdComponent} from '../ce-update-bfd/ce-update-bfd.component';
import {CeSdwanMointorComponent} from '../ce-sdwan-mointor/ce-sdwan-mointor.component';
import {CeOpenQosPoplossComponent} from '../ce-open-qos-poploss/ce-open-qos-poploss.component';
@Component({
  selector: 'app-ce-detail',
  templateUrl: './ce-detail.component.html',
  styleUrls: ['./ce-detail.component.styl']
})
export class CeDetailComponent implements OnInit, OnChanges {
  @Input()
  ceInfos: any;
  @Input()
  selectedCe: CeInventory;
  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();

  modelOption = {
    title: 'CPE详情',
    titleIcon: '',
    toggle: false
  };
  width = '800px';
  isShowUpdateBDI: boolean;
  tunnelInfos: DetailInfoObj;
  sdwanInfos: DetailInfoObj;
  selectedMonitorData = {
    name: '',
    ip: '',
    uuid: '',
    esn: '',
    cpeName: '',
    lineType: '',
    vlan: '',
    nicName: '',
  };
  lasterTime: any;
  UtilsconnectionMode = ConnectionMode;
  TunnelType = TunnelType;
  fireWalls: Array<any> = [];
  Qoss: Array<any> = [];
  QosBandwidthInfo  = null;
  targetCidrs = {
    datas: [],
    total: 0
  };
  serviceCidrs = {
    datas: [],
    total: 0
  };
  batchs = {
    datas: [],
    total: 0
  };
  navTabLists = [
    {text: '设备信息', value: 'deviceInfo'},
    {text: '可达网络', value: 'availableNetInfo'},
    {text: '防火墙', value: 'fireWallInfo'},
    {text: 'QoS', value: 'Qos'},
    {text: '策略路径', value: 'policy'},
    {text: '其他设置', value: 'other'}
  ];
  navTabListsNotVyos = [
    {text: '设备信息', value: 'deviceInfo'},
    {text: '可达网络', value: 'availableNetInfo'},
  ];
  currentTab = this.navTabLists[0];
  fireWallFridLoading = true;
  qosLoading = true;
  ceState: boolean;
  resourceQuota: any;
  policyPathTypes = [{name: '负载均衡', value: 'LoadBalance'}, {name: '应用智能链路', value: 'App'}];
  prioritys = [{text: '高', value: 'HIGH'}, {text: '低', value: 'LOW'}];
  ailLinks = [];
  wanLinks = [];
  currentAilRowIndex;
  selectedAil = {
    uuid: '',
    name: ''
  };
  policyPathInfoPage = {
    state: false,
    copyState: false,
    popAssignWans: [],
    masterWanUuid: '',
    slaveWanUuid: '',
    type: this.policyPathTypes[0].value,
    loadBalances: [],
    apps: [],
    isDisabledSave: true,
    needConfiged: false
  };
  isStrategyPathSave = false;
  isNullWeight = false;
  app_input_box = false;
  selectedApps: Array<string> = [];
  selectedApp: any;
  refreshLoading: boolean;
  selectedWanNat: any;
  qosOptimizeDatas = [];
  qosSdwanEnsureState = false;
  qosPopLossState = false;
  ospfInfo = [];
  ceTunnelManageInfo;
  ceTunnelManageState = false;
  selectedWan;
  showPolicyWanMasterLinkTips = false;
  showPolicyWanSlaveLinkTips = false;
  @ViewChild('singleMonitor')
    singleMonitorRef: SingleMointorComponent;
  @ViewChild('loading')
    loadingRef: LoadingWindowComponent;
  @ViewChild('update')
    updateEleRf: CeUpdateComponent;
  @ViewChild('updateWan')
    updateWanRef: CeUpdateWanComponent;
  @ViewChild('updateLan')
    updateLanRef: CeUpdateLanComponent;
  @ViewChild('updateCeBandwidth')
    updateCeBandwidthRef: CeUpdateBandwidthComponent;
  @ViewChild('updateCeVpnType')
    updateCeVpnTypeRef: CeUpdateVpnTypeComponent;
  @ViewChild('updateLine')
    updateLineRef: CeUpdateLineComponent;
  @ViewChild('updateCeConnectionMode')
    updateCeConnectionModeRef: CeUpdateConnectionModeComponent;
  @ViewChild('batchServiceCidr')
    batchServiceCidrEleRf: BatchServiceCidrListComponent;
  @ViewChild('deleteServiceCidr')
    deleteServiceCidrEleRf: CommonWindowComponent;
  @ViewChild('batchTargetCidr')
    batchTargetCidrEleRf: BatchTargetCidrListComponent;
  @ViewChild('deleteTargetCidr')
    deleteTargetCidrEleRf: CommonWindowComponent;
  @ViewChild('batchRoute')
    batchRouteEleRf: BatchRouteListComponent;
  @ViewChild('deleteRoute')
    deleteRouteEleRf: CommonWindowComponent;
  @ViewChild('updateCeAgentVersion')
    updateCeAgentVersionEleRef: CpeUpdateAgentVersionComponent;
  @ViewChild('firewall')
    firewallEleRf: FirewallListComponent;
  @ViewChild('deleteFirewall')
    deleteFirewallEleRf: CommonWindowComponent;
  @ViewChild('firewallAttention')
    firewallAttentionEleRf: CommonWindowComponent;
  @ViewChild('qos')
    qosEleRf: QosListComponent;
  @ViewChild('deleteQos')
    deleteQosEleRf: CommonWindowComponent;
  @ViewChild('qosBandwidth')
    qosBandwidthEleRf: QosBandwidthComponent;
  @ViewChild('disable')
    disableEleRf: CommonWindowComponent;
  @ViewChild('enable')
    enableEleRf: CommonWindowComponent;
  @ViewChild('disableNat')
    disableNatEleRf: CommonWindowComponent;
  @ViewChild('enableNat')
    enableNatEleRf: CommonWindowComponent;
  @ViewChild('addApplicationLink')
    addApplicationLinkEleRf: CeAddApplicationLinkComponent;
  @ViewChild('updateApplicationLink')
    updateApplicationLinkEleRf: CeUpdateApplicationLinkComponent;
  @ViewChild('deleteApplicationLink')
    deleteApplicationLinkEleRf: CommonWindowComponent;
  @ViewChild('ailDetailList')
    ailDetailListEleRf: CeApplicationLinkDetailListComponent;
  @ViewChild('ailDetailDelete')
    ailDetailDeleteEleRf: CommonWindowComponent;
  @ViewChild('disableStrategyPath')
    disableStrategyPathEleRf: CommonWindowComponent;
  @ViewChild('dhcpLease')
    dhcpLeaseEleRf: CeDhcpLeaseComponent;
  @ViewChild('appMonitor')
    appMonitorRef: AppMointorComponent;
  @ViewChild('sysMonitor')
    sysMonitorRef: SystemMointorComponent;
  @ViewChild('updateOspf')
  updateOspfRef: CeUpdateOspfComponent;
  @ViewChild('updateBfd')
    updateBfdEleRf: CeUpdateBfdComponent;
  @ViewChild('changeQosSdwanEnsure')
    changeQosSdwanEnsureEleRf: CommonWindowComponent;
  @ViewChild('changeQosPopLoss')
    changePopLossEleRf: CommonWindowComponent;
  @ViewChild('updateCeTunnelManage')
    updateCeTunnelManageEleRf: CommonWindowComponent;
  @ViewChild('ceSdwanMonitor')
    ceSdwanMonitorEleRf: CeSdwanMointorComponent;
  @ViewChild('ceOpenQosPoploss')
    ceOpenQosPoplossEleRf: CeOpenQosPoplossComponent;

  deleteRouteCommonOption = {
    width: '500px',
    title: '删除',
    message: '',
    params: null
  };
  deleteServiceCidrCommonOption = {
    width: '500px',
    title: '删除',
    message: '',
    params: null
  };
  deleteTargetCidrCommonOption = {
    width: '500px',
    title: '删除',
    message: '',
    params: null
  };
  deleteFirewallCommonOption = {
    width: '500px',
    title: '删除',
    message: '',
    params: null
  };
  firewallAttentionOption = {
    width: '500px',
    title: '提示',
    message: '是否保存？',
    params: null
  };
  deleteQosCommonOption = {
    width: '500px',
    title: '删除',
    message: '',
    params: null
  };
  disableCommonOption = {
    width: '500px',
    title: '禁用',
    message: ''
  };
  enableCommonOption = {
    width: '500px',
    title: '启用',
    message: ''
  };
  disableNatStateCommonOption = {
    width: '500px',
    title: '关闭',
    message: ''
  };
  enableNatStateCommonOption = {
    width: '500px',
    title: '开启',
    message: ''
  };
  disableStrategyPathCommonOption = {
    width: '500px',
    title: '禁用',
    message: ''
  };
  deleteAppCommonOption = {
    width: '500px',
    title: '删除',
    message: '',
    params: null
  };
  deleteAppDefinitionCommonOption = {
    width: '500px',
    title: '删除',
    message: '',
    params: null
  };
  changeQosSdwanEnsureOption = {
    width: '500px',
    title: '',
    message: ''
  };
  changePopLossOption = {
    width: '500px',
    title: '',
    message: ''
  };
  updateCeTunnelManageOption = {
    width: '500px',
    title: '',
    message: ''
  };
  fireWallPagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  qosPagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  constructor(
    private tunnelService: TunnelService,
    private vpeService: VpeService,
    private ceService: CeService
  ) {
  }
  ngOnInit() {
    this.tunnelInfos = new DetailInfoObj();
    this.sdwanInfos = new DetailInfoObj();
    this.sdwanInfos.master = new DetailInfoInventory();
    this.sdwanInfos.slave = new DetailInfoInventory();
    this.tunnelInfos.master = new DetailInfoInventory();
    this.tunnelInfos.slave = new DetailInfoInventory();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ceInfos) {
      this.ceInfos = changes.ceInfos.currentValue;
      if (this.ceInfos) {
        this.selectedCe = this.ceInfos.ceInventory;
        this.isShowUpdateBDI = !(
          this.ceInfos.ceInventory.configStatus === 'Config'
          && this.ceInfos.ceInventory.state === 'Enabled'
          && this.ceInfos.ceInventory.status === 'offline'
        );
      }
    }
  }

  open() {
    this.reset();
    this.modelOption.toggle = true;
    this.ceService.getDetail(this.selectedCe.uuid, datas => {
      this.ceInfos = datas;
      this.selectedCe = this.ceInfos.ceInventory;
      this.isShowUpdateBDI = !(
        this.ceInfos.ceInventory.configStatus === 'Config'
        && this.ceInfos.ceInventory.state === 'Enabled'
        && this.ceInfos.ceInventory.status === 'offline'
      );

      // 限制mcpe类型的操作菜单
      if (this.selectedCe.os !== 'vyos') {
        this.navTabLists = this.navTabListsNotVyos;
      }

      this.lasterTime = timeStampRoundToString((new Date().getTime() - new Date(this.ceInfos.ceInventory.heartBeat).getTime()) / 1000);
      this.dealDetail();
      this.ceState = this.ceInfos.ceInventory.state === 'Enabled';
      this.getResourceQuota();

      this.setTitleIcon();
    });
  }

  // 配额查询
  getResourceQuota() {
    this.ceService.getResourceQuota(this.selectedCe.uuid, 'CeVO', datas => {
      this.resourceQuota = datas;
    });
  }

  // 切换标题
  navTabsDone(data) {
    if (data.value === 'availableNetInfo') {
      if (this.ceInfos.ceInventory.l3Protocol === 'NAT') {
        this.getTargetCidr();
      }
      if (this.ceInfos.ceInventory.connectionType === 'SDWAN' && this.ceInfos.ceInventory.l3Protocol === 'BGP') {
        this.getServiceCidr();
      }
      this.getBatchRoute();
      this.queryOspf();
    }else if (data.value === 'fireWallInfo') {
      this.getFirewall();
    }else if (data.value === 'Qos') {
      this.getQos();
      this.getQosBandwidthInfo(this.selectedCe.uuid);
      this.getQosSdwanEnsure(this.selectedCe.uuid);
    }else if (data.value === 'policy') {
      this.isStrategyPathSave = false;
      this.isNullWeight = false;
      this.app_input_box = false;
      this.policyPathInfoPage = {
        state: false,
        type: this.policyPathTypes[0].value,
        popAssignWans: [],
        masterWanUuid: '',
        slaveWanUuid: '',
        copyState: false,
        loadBalances: [],
        apps: [],
        isDisabledSave: true,
        needConfiged: false
      };
      this.showPolicyWanMasterLinkTips = false;
      this.showPolicyWanSlaveLinkTips = false;
      this.getPolicyInfo();
      this.ailLinks = [
        {
          text: '主链路',
          value: this.selectedCe.popInfos.filter(item => item.haType === 'Master')[0].uuid,
          nicName: this.selectedCe.popInfos.filter(item => item.haType === 'Master')[0].nicName
        },
        {
          text: '备链路',
          value: this.selectedCe.popInfos.filter(item => item.haType === 'Slave')[0].uuid,
          nicName: this.selectedCe.popInfos.filter(item => item.haType === 'Slave')[0].nicName
        }
      ];

      this.wanLinks = [
        {
          type: 'Master',
          popUuid: this.selectedCe.popInfos.filter(item => item.haType === 'Master')[0].uuid,
          list: this.ceInfos.wanPortInventories.filter(item => item.state === 'Enabled' && item.ipCidr && item.gateway).map(item => {
            return {
              wanUuid: item.uuid,
              text: item.name
            };
          })
        },
        {
          type: 'Slave',
          popUuid: this.selectedCe.popInfos.filter(item => item.haType === 'Slave')[0].uuid,
          list: this.ceInfos.wanPortInventories.filter(item => item.state === 'Enabled' && item.ipCidr && item.gateway).map(item => {
            return {
              wanUuid: item.uuid,
              text: item.name
            };
          })
        }
      ];
    }else if (data.value === 'other') {
      this.getCeTunnelManageInfo();
    }
  }

  reset() {
    this.tunnelInfos = new DetailInfoObj();
    this.sdwanInfos = new DetailInfoObj();
    this.sdwanInfos.master = new DetailInfoInventory();
    this.sdwanInfos.slave = new DetailInfoInventory();
    this.tunnelInfos.master = new DetailInfoInventory();
    this.tunnelInfos.slave = new DetailInfoInventory();
    this.navTabLists = [
      {text: '设备信息', value: 'deviceInfo'},
      {text: '可达网络', value: 'availableNetInfo'},
      {text: '防火墙', value: 'fireWallInfo'},
      {text: 'QoS', value: 'Qos'},
      {text: '策略路径', value: 'policy'},
      {text: '其他设置', value: 'other'}
    ];
    this.currentTab = this.navTabLists[0];
  }

  close() {
    this.modelOption.toggle = false;
  }

  // 添加头部图标
  setTitleIcon() {
    let iconTitle = '';
    if (this.selectedCe.os === 'vyos') {
      iconTitle = 'icon-jhj';
    }else if (this.selectedCe.os === 'openwrt') {
      iconTitle = 'icon-mobile';
    }else if (this.selectedCe.os === 'app') {
      iconTitle = 'icon-APP2';
    }
    this.modelOption.titleIcon = iconTitle;
  }

  /*--------------------设备信息----------------------start*/
  disableCe(detail) {
    this.disableCommonOption.message = `您确定禁用CPE：<span class="red">${detail.name}</span> 吗？`;
    this.disableEleRf.open();
  }

  enableCe(detail) {
    this.enableCommonOption.message = `您确定启用CPE：<span class="red">${detail.name}</span> 吗？`;
    this.enableEleRf.open();
  }

  disableNatState(detail) {
    this.disableNatStateCommonOption.message = `您确定端口：<span class="red">${detail.name}</span> 关闭NAT吗？`;
    this.disableNatEleRf.open();
  }

  enableNatState(detail) {
    this.enableNatStateCommonOption.message = `您确定端口：<span class="red">${detail.name}</span> 开启NAT吗？`;
    this.enableNatEleRf.open();
  }

  dealDetail() {
    if (this.ceInfos) {
      if (this.ceInfos.ceInventory.connectionType === 'TUNNEL') {
        const resourceUuids = [], vpeUuids = [];
        this.ceInfos.ceInventory.popInfos.forEach((item) => {
          if (item.haType === 'Master') {
            this.tunnelInfos.master = item;
            if (item.resourceUuid) {this.tunnelInfos.master.resourceUuid = item.resourceUuid; }
            if (item.endpointUuid) {this.tunnelInfos.master.endpointUuid = item.endpointUuid; }
            if (item.nicName) {this.tunnelInfos.master.nicName = item.nicName; }
            if (item.vpnPort) {this.tunnelInfos.master.vpnPort = item.vpnPort; }
            this.tunnelInfos.master.state = item.status;
            this.tunnelInfos.master.vlan = item.vlan;
            if (item.localIp) {this.tunnelInfos.master.localIp = item.localIp; }
            if (item.vpeIp) {this.tunnelInfos.master.vpeIp = item.vpeIp; }
            if (item.netmask) {this.tunnelInfos.master.netmask = item.netmask; }
            if (item.monitorIp) {this.tunnelInfos.master.monitorIp = item.monitorIp; }
            this.tunnelInfos.master.uuid = item.uuid;
            this.tunnelInfos.master.heartBeat = item.heartBeat;
            const s = new Date().getTime() - new Date(item.heartBeat).getTime();
            this.tunnelInfos.master.heartBeat2 = timeStampRoundToString(s / 1000);
            this.tunnelInfos.master.haSwitchTime = item.haSwitchTime;
            if (item.lineType === 'TUNNEL') {
              this.tunnelInfos.master.lineName = '专线';
            } else if (item.lineType === 'VPN') {
              this.tunnelInfos.master.lineName = '公网';
            }
            if (item.vpeUuid) {this.tunnelInfos.master.vpeUuid = item.vpeUuid; }
            if (item.tunnelType) {this.tunnelInfos.master.tunnelType = item.tunnelType; }
            this.tunnelInfos.master.lineType = item.lineType;
            this.tunnelInfos.master.popPriority = item.popPriority;
          } else {
            this.tunnelInfos.slave = item;
            if (item.resourceUuid) {this.tunnelInfos.slave.resourceUuid = item.resourceUuid; }
            if (item.endpointUuid) {this.tunnelInfos.slave.endpointUuid = item.endpointUuid; }
            if (item.nicName) {this.tunnelInfos.slave.nicName = item.nicName; }
            if (item.vpnPort) {this.tunnelInfos.slave.vpnPort = item.vpnPort; }
            this.tunnelInfos.slave.state = item.status;
            this.tunnelInfos.slave.vlan = item.vlan;
            if (item.localIp) {this.tunnelInfos.slave.localIp = item.localIp; }
            if (item.vpeIp) {this.tunnelInfos.slave.vpeIp = item.vpeIp; }
            if (item.netmask) {this.tunnelInfos.slave.netmask = item.netmask; }
            if (item.monitorIp) {this.tunnelInfos.slave.monitorIp = item.monitorIp; }
            this.tunnelInfos.slave.uuid = item.uuid;
            this.tunnelInfos.slave.heartBeat = item.heartBeat;
            const s = new Date().getTime() - new Date(item.heartBeat).getTime();
            this.tunnelInfos.slave.heartBeat2 = timeStampRoundToString(s / 1000);
            this.tunnelInfos.slave.haSwitchTime = item.haSwitchTime;
            if (item.lineType === 'TUNNEL') {
              this.tunnelInfos.slave.lineName = '专线';
            } else if (item.lineType === 'VPN') {
              this.tunnelInfos.slave.lineName = '公网';
            }
            if (item.vpeUuid) {this.tunnelInfos.slave.vpeUuid = item.vpeUuid; }
            if (item.tunnelType) {this.tunnelInfos.slave.tunnelType = item.tunnelType; }
            this.tunnelInfos.slave.lineType = item.lineType;
            this.tunnelInfos.slave.popPriority = item.popPriority;
          }
          if (item.resourceUuid && resourceUuids.indexOf(item.resourceUuid) === -1) {
            resourceUuids.push(item.resourceUuid);
          }
          if (item.vpeUuid) {vpeUuids.push(item.vpeUuid); }
        });
        if (resourceUuids.length !== 0) {this.getTunnels(resourceUuids.join(',')); }
        if (vpeUuids.length !== 0) {this.getVpes(vpeUuids.join(',')); }
        if (this.tunnelInfos.master.lineName === '专线' && this.tunnelInfos.slave.lineName === '专线') {
          this.ceInfos.ceInventory.connectionMode = 'DOUBLE_TUNNEL';
        } else if (this.tunnelInfos.master.lineName === '公网' && this.tunnelInfos.slave.lineName === '公网') {
          this.ceInfos.ceInventory.connectionMode = 'DOUBLE_INTERNET';
        } else {
          this.ceInfos.ceInventory.connectionMode = 'TUNNEL_INTERNET';
        }
      } else if (this.ceInfos.ceInventory.connectionType === 'SDWAN') {
        const endpointUuids = [], vpeUuids = [];
        this.ceInfos.ceInventory.popInfos.forEach((item) => {
          if (item.haType === 'Master') {
            this.sdwanInfos.master = item;
            if (item.endpointUuid) {this.sdwanInfos.master.endpointUuid = item.endpointUuid; }
            if (item.resourceUuid) {this.sdwanInfos.master.resourceUuid = item.resourceUuid; }
            if (item.nicName) {this.sdwanInfos.master.nicName = item.nicName; }
            if (item.vpnPort) {this.sdwanInfos.master.vpnPort = item.vpnPort; }
            this.sdwanInfos.master.state = item.status;
            this.sdwanInfos.master.heartBeat = item.heartBeat;
            const s = new Date().getTime() - new Date(item.heartBeat).getTime();
            this.sdwanInfos.master.heartBeat2 = timeStampRoundToString(s / 1000);
            this.sdwanInfos.master.haSwitchTime = item.haSwitchTime;
            if (item.lineType === 'TUNNEL') {
              this.sdwanInfos.master.lineName = '专线';
            } else if (item.lineType === 'VPN') {
              this.sdwanInfos.master.lineName = '公网';
            }
            if (item.vpeUuid) {this.sdwanInfos.master.vpeUuid = item.vpeUuid; }
            if (item.rtt !== undefined) {this.sdwanInfos.master.rtt = item.rtt; }
            if (item.disconnectCount !== undefined) {this.sdwanInfos.master.disconnectCount = item.disconnectCount; }
            if (item.loss !== undefined) {this.sdwanInfos.master.loss = item.loss; }
            if (item.localIp) {this.sdwanInfos.master.localIp = item.localIp; }
            if (item.vpeIp) {this.sdwanInfos.master.vpeIp = item.vpeIp; }
            if (item.netmask) {this.sdwanInfos.master.netmask = item.netmask; }
            if (item.monitorIp) {this.sdwanInfos.master.monitorIp = item.monitorIp; }
            if (item.vlan) {this.sdwanInfos.master.vlan = item.vlan; }
            if (item.tunnelType) {this.sdwanInfos.master.tunnelType = item.tunnelType; }
            this.sdwanInfos.master.uuid = item.uuid;
            this.sdwanInfos.master.lineType = item.lineType;
            this.sdwanInfos.master.rttText = 'rtt:' + this.sdwanInfos.master.rtt + ', loss: ' + this.sdwanInfos.master.loss + ', disconnectCount:' + this.sdwanInfos.master.disconnectCount;
            this.sdwanInfos.master.popPriority = item.popPriority;
          } else {
            this.sdwanInfos.slave = item;
            if (item.endpointUuid) {this.sdwanInfos.slave.endpointUuid = item.endpointUuid; }
            if (item.resourceUuid) {this.sdwanInfos.slave.resourceUuid = item.resourceUuid; }
            if (item.nicName) {this.sdwanInfos.slave.nicName = item.nicName; }
            if (item.vpnPort) {this.sdwanInfos.slave.vpnPort = item.vpnPort; }
            this.sdwanInfos.slave.state = item.status;
            this.sdwanInfos.slave.heartBeat = item.heartBeat;
            const s = new Date().getTime() - new Date(item.heartBeat).getTime();
            this.sdwanInfos.slave.heartBeat2 = timeStampRoundToString(s / 1000);
            this.sdwanInfos.slave.haSwitchTime = item.haSwitchTime;
            if (item.lineType === 'TUNNEL') {
              this.sdwanInfos.slave.lineName = '专线';
            } else if (item.lineType === 'VPN') {
              this.sdwanInfos.slave.lineName = '公网';
            }
            if (item.vpeUuid) {this.sdwanInfos.slave.vpeUuid = item.vpeUuid; }
            if (item.rtt !== undefined) {this.sdwanInfos.slave.rtt = item.rtt; }
            if (item.disconnectCount !== undefined) {this.sdwanInfos.slave.disconnectCount = item.disconnectCount; }
            if (item.loss !== undefined) {this.sdwanInfos.slave.loss = item.loss; }
            if (item.localIp) {this.sdwanInfos.slave.localIp = item.localIp; }
            if (item.vpeIp) {this.sdwanInfos.slave.vpeIp = item.vpeIp; }
            if (item.netmask) {this.sdwanInfos.slave.netmask = item.netmask; }
            if (item.monitorIp) {this.sdwanInfos.slave.monitorIp = item.monitorIp; }
            if (item.vlan) {this.sdwanInfos.slave.vlan = item.vlan; }
            if (item.tunnelType) {this.sdwanInfos.slave.tunnelType = item.tunnelType; }
            this.sdwanInfos.slave.uuid = item.uuid;
            this.sdwanInfos.slave.lineType = item.lineType;
            this.sdwanInfos.slave.rttText = 'rtt:' + this.sdwanInfos.slave.rtt + ', loss: ' + this.sdwanInfos.slave.loss + ', disconnectCount:' + this.sdwanInfos.slave.disconnectCount;
            this.sdwanInfos.slave.popPriority = item.popPriority;
          }
          if (item.endpointUuid && endpointUuids.indexOf(item.endpointUuid) === -1) {endpointUuids.push(item.endpointUuid); }
          if (item.vpeUuid) {vpeUuids.push(item.vpeUuid); }
        });
        if (endpointUuids.length !== 0) {this.getL3Endpoints(endpointUuids.join(',')); }
        if (vpeUuids.length !== 0) {this.getVpes(vpeUuids.join(',')); }
        if (this.sdwanInfos.master.lineName === '专线' && this.sdwanInfos.slave.lineName === '专线') {
          this.ceInfos.ceInventory.connectionMode = 'DOUBLE_TUNNEL';
        } else if (this.sdwanInfos.master.lineName === '公网' && this.sdwanInfos.slave.lineName === '公网') {
          this.ceInfos.ceInventory.connectionMode = 'DOUBLE_INTERNET';
        } else {
          this.ceInfos.ceInventory.connectionMode = 'TUNNEL_INTERNET';
        }
      }
    }
  }

  getTunnels(uuids) {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'uuid', op: 'in', value: uuids});
    const sub = this.tunnelService.query(qobj, (tunnels) => {
      sub.unsubscribe();
      tunnels.forEach((item) => {
        if (this.tunnelInfos.master.resourceUuid === item.uuid) {
          this.tunnelInfos.master.tunnelName = item.name;
          item.tunnelSwitchs.forEach((i) => {
            if (i.endpointUuid === this.tunnelInfos.master.endpointUuid) {
              this.tunnelInfos.master.endpointName = i.endpointName;
            }
          });
        } else if (this.tunnelInfos.slave.resourceUuid === item.uuid) {
          this.tunnelInfos.slave.tunnelName = item.name;
          item.tunnelSwitchs.forEach((i) => {
            if (i.endpointUuid === this.tunnelInfos.slave.endpointUuid) {
              this.tunnelInfos.slave.endpointName = i.endpointName;
            }
          });
        }
      });
    });
  }

  getL3Endpoints(uuids) {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'uuid', op: 'in', value: uuids});
    const sub = this.tunnelService.queryL3Endpoint(qobj, (datas) => {
      sub.unsubscribe();
      datas.forEach((item) => {
        if (this.sdwanInfos.master.endpointUuid === item.uuid) {
          this.sdwanInfos.master.endpointName = item.endpointName;
          this.sdwanInfos.master.interfaceName = item.interfaceName;
        } else if (this.sdwanInfos.slave.endpointUuid === item.uuid) {
          this.sdwanInfos.slave.endpointName = item.endpointName;
          this.sdwanInfos.slave.interfaceName = item.interfaceName;
        }
      });
    });
  }

  getVpes(uuids) {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'uuid', op: 'in', value: uuids});
    const sub = this.vpeService.query(qobj, (datas) => {
      sub.unsubscribe();
      datas.forEach((item) => {
        if (this.ceInfos.ceInventory.connectionType === 'SDWAN') {
          if (this.sdwanInfos.master.vpeUuid === item.uuid) {
            this.sdwanInfos.master.vpeName = item.name;
            this.sdwanInfos.master.manageIp = item.manageIp;
          }
          if (this.sdwanInfos.slave.vpeUuid === item.uuid) {
            this.sdwanInfos.slave.vpeName = item.name;
            this.sdwanInfos.slave.manageIp = item.manageIp;
          }
        } else if (this.ceInfos.ceInventory.connectionType === 'TUNNEL') {
          if (this.tunnelInfos.master.vpeUuid === item.uuid) {
            this.tunnelInfos.master.vpeName = item.name;
            this.tunnelInfos.master.manageIp = item.manageIp;
          }
          if (this.tunnelInfos.slave.vpeUuid === item.uuid) {
            this.tunnelInfos.slave.vpeName = item.name;
            this.tunnelInfos.slave.manageIp = item.manageIp;
          }
        }
      });
    });
  }

  updateAgenVersionDone(params) {
    this.loadingRef.open();
    this.ceService.upgradeAgentVersion(params, (data) => {
      this.loadingRef.cancel();
      this.ceInfos.ceInventory = data.inventory;
      this.dealDetail();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  qosBandwidthDone(params) {
    this.loadingRef.open();
    this.ceService.updateQosBandwidth(params, (ret) => {
      if (ret.qosType === 'wan') {
        this.QosBandwidthInfo.wanBandwidth = Math.round(ret.bandwidth / (1024 * 1024));
      }else {
        this.QosBandwidthInfo.tunBandwidth = Math.round(ret.bandwidth / (1024 * 1024));
      }

      this.loadingRef.cancel();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  changeStateDone(stateValue) {
    this.ceState = stateValue;
    if (stateValue) {
      /*this.done.emit({clickName: 'enable', data: this.selectedCe});*/
      this.enableCe(this.ceInfos.ceInventory);
    }else {
      /*this.done.emit({clickName: 'disable', data: this.selectedCe});*/
      this.disableCe(this.ceInfos.ceInventory);
    }
  }

  changeNatStateDone(value, port) {
    this.selectedWanNat = port;
    if (value) {
      this.selectedWanNat.natState = 'Enabled';
      this.enableNatState(port);
    }else {
      this.selectedWanNat.natState = 'Disabled';
      this.disableNatState(port);
    }
  }

  disableDone() {
    this.loadingRef.open();
    this.ceService.disable(this.selectedCe, (data) => {
      this.loadingRef.cancel();
      this.ceInfos.ceInventory = data;
      this.done.emit({clickName: 'disableDone', data: data});
    }, () => {
      this.disableCancelDone();
      this.loadingRef.cancel();
    });
  }

  enableDone() {
    this.loadingRef.open();
    this.ceService.enable(this.selectedCe, (data) => {
      this.loadingRef.cancel();
      this.ceInfos.ceInventory = data;
      this.done.emit({clickName: 'enableDone', data: data});
    }, () => {
      this.enableCancelDone();
      this.loadingRef.cancel();
    });
  }

  disableCancelDone() {
    this.ceState = this.ceInfos.ceInventory.state === 'Enabled';
  }

  enableCancelDone() {
    this.ceState = this.ceInfos.ceInventory.state === 'Enabled';
  }

  /*bfd设置*/
  ceUpdateBfdDone(e) {
    this.loadingRef.open();
    this.ceService.updateBfd(e, (data) => {
      this.loadingRef.cancel();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  // 内存，CPU的监控
  openSysMonitor() {
    setTimeout(() => {
      this.sysMonitorRef.open();
    });
  }

  updateDone(params) {
    this.loadingRef.open();
    this.ceService.update(params, (ce: CeInventory) => {
      this.loadingRef.cancel();
      this.done.emit({clickName: 'updateName', data: ce});
      this.ceInfos.ceInventory = this.selectedCe = ce;
      this.dealDetail();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  updateBandwidthDone(params) {
    this.loadingRef.open();
    this.ceService.updateBandwidth(params, (data) => {
      this.loadingRef.cancel();
      if (data) {
        this.ceInfos.ceInventory = data;
        this.done.emit({clickName: 'changeBandwidth', data: data});
      }
    }, () => {
      this.loadingRef.cancel();
    });
  }

  updateVpnTypeDone(data) {
    this.loadingRef.open();
    this.ceService.updateVpnType(data, (res) => {
      this.loadingRef.cancel();
      this.ceInfos.ceInventory = res;
      this.dealDetail();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  // 主备链路监控
  openMonitor(sdwanInfos) {
    this.selectedMonitorData.esn = this.ceInfos.ceInventory.esn;
    this.selectedMonitorData.cpeName = this.ceInfos.ceInventory.name;
    this.selectedMonitorData.name = !sdwanInfos.endpointName && !sdwanInfos.vpeName ?
      ( (sdwanInfos.haType === 'Master' ? '(主/' : '(备/' ) + sdwanInfos.lineName + ')' )
      :
      ( (sdwanInfos.haType === 'Master' ? '(主)' : '(备)') + (sdwanInfos.vpeName || sdwanInfos.endpointName ) );
    this.selectedMonitorData.ip = sdwanInfos.manageIp;
    this.selectedMonitorData.uuid = sdwanInfos.uuid;
    this.selectedMonitorData.lineType = sdwanInfos.lineType;
    this.selectedMonitorData.vlan = sdwanInfos.vlan;
    this.selectedMonitorData.nicName = sdwanInfos.nicName;
    const timer = setTimeout(() => {
      clearTimeout(timer);
      this.singleMonitorRef.open();
    }, 0);
  }

  // 修改主备链路
  updateLineDone(param) {
    this.loadingRef.open();
    this.ceService.updateCeLine(param, (data) => {
      this.loadingRef.cancel();
      this.close();
      this.done.emit({clickName: 'updateLine', data: data});
    }, () => {
      this.loadingRef.cancel();
    });
  }

  // 修改链路模式
  updateConnectionModeDone(params) {
    this.loadingRef.open();
    this.ceService.updateConnectionMode(params, (data) => {
      this.loadingRef.cancel();
      this.close();
      this.done.emit({clickName: 'updateConnectionMode', data: data});
    }, () => {
      this.loadingRef.cancel();
    });
  }
  /*--------------------设备信息----------------------end*/

  /*-------------可达网络(业务网段，目标网段，静态路由，wan，lan设置)-------------------start*/

  getServiceCidr() {
    const qobj = new QueryObject();
    qobj.start = 0;
    qobj.limit = 10;
    qobj.sortBy = 'createDate';
    qobj.sortDirection = 'desc';
    qobj.addCondition({name: 'resourceUuid', op: '=', value: this.ceInfos.ceInventory.uuid});
    qobj.addCondition({name: 'resourceType', op: '=', value: 'CeVO'});
    const sub = this.ceService.queryServiceCidr(qobj, (datas, total) => {
      sub.unsubscribe();
      this.serviceCidrs.datas = datas;
      this.serviceCidrs.total = total;
    });
  }

  getTargetCidr() {
    const qobj = new QueryObject();
    qobj.start = 0;
    qobj.limit = 10;
    qobj.sortBy = 'createDate';
    qobj.sortDirection = 'desc';
    qobj.addCondition({name: 'ceUuid', op: '=', value: this.ceInfos.ceInventory.uuid});
    const sub = this.ceService.queryTargetCidr(qobj, (datas, total) => {
      sub.unsubscribe();
      this.targetCidrs.datas = datas;
      this.targetCidrs.total = total;
    });
  }

  getBatchRoute() {
    const qobj = new QueryObject();
    qobj.start = 0;
    qobj.limit = 500;
    qobj.sortBy = 'createDate';
    qobj.sortDirection = 'desc';
    qobj.addCondition({name: 'ceUuid', op: '=', value: this.ceInfos.ceInventory.uuid});
    const sub = this.ceService.queryBatch(qobj, (datas, total) => {
      sub.unsubscribe();
      this.batchs.datas = datas;
      this.batchs.total = total;
    });
  }

  // 处理业务网段回调
  batchServiceCidrDone(params) {
    if (params.type === 'add') {
      this.loadingRef.open();
      this.ceService.createServiceCidr(params.data, (datas) => {
        this.loadingRef.cancel();
        this.serviceCidrs.datas.unshift(...datas);
        this.batchServiceCidrEleRf.search(true);
        this.getResourceQuota();
      }, () => {
        this.loadingRef.cancel();
      });
    }else if (params.type === 'delete') {
      this.deleteServiceCidrCommonOption.message = `请确认是否删除该业务网段?`;
      this.deleteServiceCidrCommonOption.params = params.data;
      this.deleteServiceCidrEleRf.open();
    }
  }

  // 处理静态路由回调
  batchRouteDone(params) {
    if (params.type === 'add') {
      this.loadingRef.open();
      this.ceService.createCeRoute(params.data, (datas) => {
        this.loadingRef.cancel();
        this.batchs.datas.unshift(...datas);
        this.batchRouteEleRf.search(true);
        this.getResourceQuota();
      }, () => {
        this.loadingRef.cancel();
      });
    }else if (params.type === 'delete') {
      this.deleteRouteCommonOption.message = `删除不可恢复，请确认是否删除静态路由?`;
      this.deleteRouteCommonOption.params = params.data;
      this.deleteRouteEleRf.open();
    }
  }

  // 处理目标网段回调
  batchTargetCidrDone(params) {
    if (params.type === 'add') {
      this.loadingRef.open();
      this.ceService.createTargetCidr(params.data, (datas) => {
        this.loadingRef.cancel();
        this.targetCidrs.datas.unshift(...datas);
        this.batchTargetCidrEleRf.search(true);
        this.getResourceQuota();
      }, () => {
        this.loadingRef.cancel();
      });
    }else if (params.type === 'delete') {
      this.deleteTargetCidrCommonOption.message = `请确认是否删除该目标网段?`;
      this.deleteTargetCidrCommonOption.params = params.data;
      this.deleteTargetCidrEleRf.open();
    }
  }

  deleteRouteDone() {
    this.loadingRef.open();
    this.ceService.deleteCeRoute(this.deleteRouteCommonOption.params, () => {
      this.loadingRef.cancel();
      this.getBatchRoute();
      this.batchRouteEleRf.search(true);
      this.getResourceQuota();
      this.batchRouteEleRf.reset();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  deleteTargetCidrDone() {
    this.loadingRef.open();
    this.ceService.deleteTargetCidr(this.deleteTargetCidrCommonOption.params, () => {
      this.loadingRef.cancel();
      this.getTargetCidr();
      this.batchTargetCidrEleRf.search(true);
      this.getResourceQuota();
      this.batchTargetCidrEleRf.reset();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  deleteServiceCidrDone() {
    this.loadingRef.open();
    this.ceService.deleteServiceCidr(this.deleteServiceCidrCommonOption.params, () => {
      this.loadingRef.cancel();
      this.getServiceCidr();
      this.batchServiceCidrEleRf.search(true);
      this.getResourceQuota();
      this.batchServiceCidrEleRf.reset();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  // 启用、禁用wan下的nat
  disableNatDone() {
    this.loadingRef.open();
    const infoPage = {
      cePortUuid: this.selectedWanNat.uuid,
      ceUuid: this.selectedCe.uuid
    };
    this.ceService.disableNat(infoPage, (data) => {
      this.loadingRef.cancel();
      this.ceInfos.wanPortInventories.filter(item => item.uuid === data.uuid)[0].natState = data.natState;
    }, () => {
      this.disableNatCancelDone();
      this.loadingRef.cancel();
    });
  }

  enableNatDone() {
    this.loadingRef.open();
    const infoPage = {
      cePortUuid: this.selectedWanNat.uuid,
      ceUuid: this.selectedCe.uuid
    };
    this.ceService.enableNat(infoPage, (data) => {
      this.ceInfos.wanPortInventories.filter(item => item.uuid === data.uuid)[0].natState = data.natState;
      this.loadingRef.cancel();
    }, () => {
      this.enableNatCancelDone();
      this.loadingRef.cancel();
    });
  }

  disableNatCancelDone() {
    const current = this.ceInfos.wanPortInventories.filter(item => item.uuid === this.selectedWanNat.uuid)[0];
    current.natState = this.selectedWanNat.natState === 'Enabled' ? 'Disabled' : 'Enabled';
  }

  enableNatCancelDone() {
    const current = this.ceInfos.wanPortInventories.filter(item => item.uuid === this.selectedWanNat.uuid)[0];
    current.natState = this.selectedWanNat.natState === 'Enabled' ? 'Disabled' : 'Enabled';
  }

  // OSPF
  queryOspf() {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'ceUuid', op: '=', value: this.ceInfos.ceInventory.uuid});
    const sub = this.ceService.queryOspf(qobj, (datas, total) => {
      sub.unsubscribe();
      this.ospfInfo = total > 0 ? datas : [];
    });
  }

  updateOspfDone(params) {
    this.loadingRef.open();
    if (params.state === 'Enabled') {
      this.ceService.enableOspf(params, (datas: any) => {
        this.ospfInfo = [];
        this.ospfInfo.push(datas);
        this.loadingRef.cancel();
      }, () => {
        this.loadingRef.cancel();
      });
    }else {
      this.ceService.disableOspf(params, (datas: any) => {
        this.ospfInfo = [];
        this.loadingRef.cancel();
      }, () => {
        this.loadingRef.cancel();
      });
    }
  }

  // 修改lan
  updateLanInfoDone(params) {
    this.loadingRef.open();
    this.ceService.updateLan(params, (data) => {
      this.loadingRef.cancel();
      this.queryOspf();
      if (data) {
        this.ceInfos.lanInfoInventory = data;
      }
    }, () => {
      this.loadingRef.cancel();
    });
  }

  updateCePortDone() {
    this.done.emit({clickName: 'updateWan'});
  }

  // 刷新IP
  refreshIp(currentWanPort) {
    this.refreshLoading = true;
    if (this.selectedCe.os === 'vyos' ) {
      const infoPage = {
        uuid: this.selectedCe.uuid,
        portNames: [currentWanPort.name]
      };
      this.ceService.syncPortInfo(infoPage, res => {
        this.refreshLoading = false;
        console.log(res);
      }, () => {
        this.refreshLoading = false;
      });
    }else {
      this.ceService.refreshCeHeart(currentWanPort.uuid, (heartBeat) => {
        this.refreshLoading = false;
      }, () => {
        this.refreshLoading = false;
      });
    }
  }

  wanClickDone(data) {
    if (data.type === 'queryChart') {
      this.selectedWan = data.current;
      setTimeout(() => {
        this.ceSdwanMonitorEleRf.open();
      });
    }
  }
  /*-------------可达网络(业务网段，目标网段，静态路由，wan，lan设置)-------------------end*/

  /*---------------------qos--------------------------start*/
  getQos() {
    const qobj = new QueryObject();
    qobj.start = (this.qosPagination.current - 1) * this.qosPagination.size;
    qobj.limit = this.qosPagination.size;
    qobj.sortBy = 'number';
    qobj.sortDirection = 'desc';
    qobj.addCondition({name: 'ceUuid', op: '=', value: this.ceInfos.ceInventory.uuid});
    this.Qoss = [];
    this.qosLoading = true;
    const sub = this.ceService.queryQos(qobj, (datas, total) => {
      sub.unsubscribe();
      this.qosLoading = false;
      this.Qoss = datas;
      this.qosPagination.total = total;
      this.qosPagination.show = total !== 0;
    });
  }

  getQosBandwidthInfo(ceUuid) {
    this.QosBandwidthInfo = null;
    this.ceService.getQosBandwidth(ceUuid, (rets) => {
      this.QosBandwidthInfo = rets;
      if (rets) {
        this.QosBandwidthInfo.popBandwidth = Math.round(rets.popBandwidth / (1024 * 1024));
        this.QosBandwidthInfo.wanBandwidth = Math.round(rets.wanBandwidth / (1024 * 1024));
        this.QosBandwidthInfo.tunBandwidth = Math.round(rets.tunBandwidth / (1024 * 1024));
      }
    });
  }

  getQosSdwanEnsure(ceUuid) {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'uuid', op: '=', value: ceUuid});
    this.ceService.queryCeQosOptimize(qobj, (datas, total) => {
      this.qosOptimizeDatas = datas;
      if (!total) {
        this.qosSdwanEnsureState = false;
        this.qosPopLossState = false;
      }else {
        this.qosSdwanEnsureState = datas[0].wanBandwidthEnsure === 'Enabled';
        this.qosPopLossState = datas[0].popLoss === 'Enabled';
      }
    });
  }

  // 切换SDWAN隧道带宽保障
  changeQosSdwanEnsureState(state) {
    this.qosSdwanEnsureState = state;
    this.changeQosSdwanEnsureOption.title = state ? '开启' : '禁用';
    this.changeQosSdwanEnsureOption.message = `请确定是否${state ? '开启' : '禁用'}SDWAN隧道带宽保障？`;
    this.changeQosSdwanEnsureEleRf.open();
  }

  // 切换链路优化
  changeQosPopLossState(state) {
    this.qosPopLossState = state;
    if (state) {
      setTimeout(() => {
        this.ceOpenQosPoplossEleRf.openDialog();
      });
    }else {
      this.changePopLossOption.title = state ? '开启' : '禁用';
      this.changePopLossOption.message = `请确定是否${state ? '开启' : '禁用'}链路优化？`;
      this.changePopLossEleRf.open();
    }
  }

  changeQosSdwanCancelDone() {
    if (this.qosOptimizeDatas.length) {
      this.qosSdwanEnsureState = this.qosOptimizeDatas[0].wanBandwidthEnsure === 'Enabled';
      this.qosPopLossState = this.qosOptimizeDatas[0].popLoss === 'Enabled';
    }else {
      this.qosSdwanEnsureState = false;
      this.qosPopLossState = false;
    }
  }

  changeQosSdwanDone() {
    this.loadingRef.open();
    if (this.qosSdwanEnsureState) {
      this.ceService.enableQosSdwanEnsure(this.selectedCe.uuid, data => {
        this.getQos();
        this.loadingRef.cancel();
      }, () => {
        this.changeQosSdwanCancelDone();
        this.loadingRef.cancel();
      });
    }else {
      this.ceService.disableQosSdwanEnsure(this.selectedCe.uuid, data => {
        this.getQos();
        this.loadingRef.cancel();
      }, () => {
        this.changeQosSdwanCancelDone();
        this.loadingRef.cancel();
      });
    }
  }

  ceOpenQosPoplossDone(event) {
    if (event.type === 'cancel') {
      this.changeQosSdwanCancelDone();
    }else {
      this.loadingRef.open();
      this.ceService.enableQosPopLoss(this.selectedCe.uuid, event.data, data => {
        this.getQosSdwanEnsure(this.selectedCe.uuid);
        this.loadingRef.cancel();
      }, () => {
        this.changeQosSdwanCancelDone();
        this.loadingRef.cancel();
      });
    }
  }

  changePopLossDone() {
    this.loadingRef.open();
    if (this.qosPopLossState) {

    }else {
      this.ceService.disableQosPopLoss(this.selectedCe.uuid, data => {
        this.getQos();
        this.getQosSdwanEnsure(this.selectedCe.uuid);
        this.loadingRef.cancel();
      }, () => {
        this.changeQosSdwanCancelDone();
        this.loadingRef.cancel();
      });
    }
  }

  qosDone(params) {
    if (params.type === 'add') {
      this.loadingRef.open();
      this.ceService.createQos(params.data, (datas) => {
        this.loadingRef.cancel();
        this.getQos();
        this.qosEleRf.search(true);
      }, () => {
        this.loadingRef.cancel();
      });
    }else if (params.type === 'delete') {
      this.deleteQosCommonOption.message = `删除操作不可恢复,请确定是否删除QoS规则?`;
      this.deleteQosCommonOption.params = params.data;
      this.deleteQosEleRf.open();
    }
  }

  deleteQosDone() {
    this.loadingRef.open();
    this.ceService.deleteQos(this.deleteQosCommonOption.params, () => {
      this.loadingRef.cancel();
      this.qosEleRf.qoss = chooseOtherFromAll(this.qosEleRf.qoss, this.deleteQosCommonOption.params.uuids, 'uuid');
      this.Qoss = chooseOtherFromAll(this.Qoss, this.deleteQosCommonOption.params.uuids, 'uuid');
      this.qosEleRf.reset();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  qosPageChange(size: number, isSize: boolean) {
    if (isSize) {
      this.qosPagination.current = 1;
      this.qosPagination.size = size;
    } else {
      this.qosPagination.current = size;
    }
    this.getQos();
  }
  /*-----------------------qos-------------------------end*/

  /*-----------------------防火墙--------------------------------------------start*/
  getFirewall() {
    const qobj = new QueryObject();
    qobj.start = (this.fireWallPagination.current - 1) * this.fireWallPagination.size;
    qobj.limit = this.fireWallPagination.size;
    qobj.sortBy = 'rank';
    qobj.addCondition({name: 'ceUuid', op: '=', value: this.ceInfos.ceInventory.uuid});
    this.fireWalls = [];
    this.fireWallFridLoading = true;
    const sub = this.ceService.queryFireWall(qobj, (datas, total) => {
      sub.unsubscribe();
      this.fireWallFridLoading = false;
      this.fireWalls = datas;
      this.fireWallPagination.total = total;
      this.fireWallPagination.show = total !== 0;
    });
  }

  firewallDone(params) {
    if (params.type === 'add') {
      this.firewallEleRf.refresh(params);
    }else if (params.type === 'delete') {
      this.deleteFirewallCommonOption.message = `删除操作不可恢复,请确定是否删除防火墙配置?`;
      this.deleteFirewallCommonOption.params = params.data;
      this.deleteFirewallEleRf.open();
    }else if (params.type === 'save') {
      this.loadingRef.open();
      this.ceService.addListFirewall(params.data, (rets: Array<FirewallInventory>) => {
        this.loadingRef.cancel();
        // this.refreshFirewall(rets);
        this.getFirewall();
        // this.firewallEleRf.search();
      }, () => {
        this.loadingRef.cancel();
      });
    }else if (params.type === 'attention') {
      this.firewallAttentionEleRf.open();
    }
  }

  firewallAttentionDone() {
    this.firewallEleRf.save();
  }

  firewallAttentionCancelDone() {
    this.firewallEleRf.dialogOptions.visible = false;
  }

  deleteFirewallDone() {
    this.firewallEleRf.refresh({type: 'delete', data: this.deleteFirewallCommonOption.params});
  }

  fireWallPageChange(size: number, isSize: boolean) {
    if (isSize) {
      this.fireWallPagination.current = 1;
      this.fireWallPagination.size = size;
    } else {
      this.fireWallPagination.current = size;
    }
    this.getFirewall();
  }

  refreshFirewall (datas) {
    this.fireWalls = datas;
    this.fireWallPagination.total = this.fireWalls.length;
    this.fireWallPagination.show = this.fireWalls.length !== 0;
  }
  /*-----------------------防火墙--------------------------------------------end*/

  /*--------------------------策略路径 ----------------------start*/
  getPolicyInfo () {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'uuid', op: '=', value: this.selectedCe.uuid});
    this.ceService.queryStrategyPath(qobj, (datas) => {
      if (datas[0].needConfiged) {
        this.unbindDisabled();
      }

      if (datas.length) {
        this.policyPathInfoPage.state = datas[0].state === 'Enabled';
        this.policyPathInfoPage.copyState = datas[0].state === 'Enabled';
        this.policyPathInfoPage.type = datas[0].type;

        this.policyPathInfoPage.masterWanUuid = this.selectedCe.popInfos.filter(item => item.haType === 'Master')[0].wanUuid || '';
        if (this.policyPathInfoPage.masterWanUuid && !this.wanLinks[0].list.filter(item => item.wanUuid === this.policyPathInfoPage.masterWanUuid).length) {
          this.showPolicyWanMasterLinkTips = true;
        }

        this.policyPathInfoPage.slaveWanUuid = this.selectedCe.popInfos.filter(item => item.haType === 'Slave')[0].wanUuid || '';
        if (this.policyPathInfoPage.slaveWanUuid && !this.wanLinks[1].list.filter(item => item.wanUuid === this.policyPathInfoPage.slaveWanUuid).length) {
          this.showPolicyWanSlaveLinkTips = true;
        }

        this.getStrategyPath(datas[0].type);
      }
    });
  }

  changeMasterLink() {
    this.showPolicyWanMasterLinkTips = false;
  }

  changeSlaveLink() {
    this.showPolicyWanSlaveLinkTips = false;
  }

  unbindDisabled() {
    this.policyPathInfoPage.isDisabledSave = false;
  }

  getStrategyPath(type) {
    const infoPage = {
      uuid: this.selectedCe.uuid,
      type: type
    };

    this.ceService.getStrategyPath(infoPage, (res) => {
        if (res) {
          if (type === 'LoadBalance') {
            this.policyPathInfoPage.loadBalances = res.loadBalanceInventories;
            if (this.policyPathInfoPage.loadBalances.length) {
              this.policyPathInfoPage.loadBalances.map(item => {

                this.selectedCe.popInfos.forEach(it => {
                  if (it.uuid === item.popUuid) {
                    item.haTypeName = it.haType === 'Master' ? '主链路' :  '备链路';
                  }
                });

                if (!item.weight) {
                  item.weight = '';
                }
                return item;
              });
            }
            this.policyPathInfoPage.loadBalances.sort((a, b) => {
              if (a.haTypeName === '主链路') {
                return -1;
              }
              return 0;
            });
          }else {
            this.policyPathInfoPage.apps = res.appInventories;
            if (res.appInventories.length) {
              this.policyPathInfoPage.apps = res.appInventories.map(item => {
                if (!item.nicName) {
                  item.nicName = '';
                }
                item.status = false;
                return item;
              });
            }
          }
        }
      });
  }

  clickAppId() {
    this.selectedApps = this.policyPathInfoPage.apps.filter(item => item.status).map(it => it.uuid);
  }

  selectAllApp(value) {
    if (value) {
      this.policyPathInfoPage.apps.map(item => {
        if (item.type !== 'DEFAULT') {
          item.status = true;
        }
      });
    }else {
      this.policyPathInfoPage.apps.map(item => {
        item.status = false;
      });
    }
    this.clickAppId();
  }

  changeStrategyPathState(dataValue) {
    if (!dataValue && this.policyPathInfoPage.copyState) {
      this.disableStrategyPath();
    }
    this.unbindDisabled();
  }

  disableStrategyPath() {
    this.disableStrategyPathCommonOption.message = `您确定禁用该策略路径吗？`;
    this.disableStrategyPathEleRf.open();
  }

  disableStrategyPathCancelDone() {
    this.policyPathInfoPage.state = ! this.policyPathInfoPage.state;
  }

  strategyPathTypeChange(type) {
    this.isStrategyPathSave = false;
    this.isNullWeight = false;
    this.app_input_box = false;
    this.selectedApps = [];
    this.getStrategyPath(type);
    this.unbindDisabled();
  }

  configAppDefination(data) {
    this.selectedAil = data;
    setTimeout(() => {
      this.ailDetailListEleRf.openDialog();
    });
  }

  addApplicationLinkClick() {
    this.addApplicationLinkEleRf.openDialog();
  }

  addApplicationLinkDone(params) {
    this.loadingRef.open();
    this.ceService.addApp(params, data => {
      // this.policyPathInfoPage.apps.unshift(data);
      this.policyPathInfoPage.apps.splice(this.policyPathInfoPage.apps.length - 1 , 0, data);
      this.policyPathInfoPage.apps.map(item => {
        if (!item.nicName) {
          item.nicName = '';
        }
        return item;
      });
      this.loadingRef.cancel();
      this.unbindDisabled();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  updateApplicationNameDone(params) {
    this.loadingRef.open();
    this.ceService.updateApp(params, data => {
      arrayUpdateItem(this.policyPathInfoPage.apps, data, 'update');
      this.loadingRef.cancel();
      this.unbindDisabled();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  updateApplicationLinkDone(params) {
    if (params.type === 'add') {
      this.loadingRef.open();
      this.ceService.addAppDefinition(params.data, res => {
        this.loadingRef.cancel();
        this.ailDetailListEleRf.search(true);
        this.unbindDisabled();
      }, () => {
        this.loadingRef.cancel();
      });
    }else if (params.type === 'delete') {
      this.deleteAppDefinitionCommonOption.message = `请确定是否删除该应用定义？`;
      this.deleteAppDefinitionCommonOption.params = params.data;
      this.ailDetailDeleteEleRf.open();
    }
  }

  deleteAppDefinitionDone() {
    this.loadingRef.open();
    this.ceService.batchDeleteAppDefinition(this.deleteAppDefinitionCommonOption.params, () => {
      this.loadingRef.cancel();
      this.ailDetailListEleRf.applicationLists = chooseOtherFromAll(this.ailDetailListEleRf.applicationLists, this.deleteAppDefinitionCommonOption.params.uuids, 'uuid');
      this.ailDetailListEleRf.reset();
      this.unbindDisabled();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  deleteApplicationLinkClick() {
    this.deleteAppCommonOption.message = `请确定是否删除该应用链路？`;
    this.deleteApplicationLinkEleRf.open();
  }

  deleteAppDone() {
    this.loadingRef.open();
    const infoPage = {
      ceUuid: this.selectedCe.uuid,
      uuids: this.selectedApps
    };
    this.ceService.batchDeleteApp(infoPage, () => {
      this.loadingRef.cancel();
      this.policyPathInfoPage.apps = chooseOtherFromAll(this.policyPathInfoPage.apps, infoPage.uuids, 'uuid');
      this.selectedApps = [];
      this.unbindDisabled();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  policyPathConfirm() {
    let isCanSave = false;
    const infoPage = {
        uuid: this.selectedCe.uuid,
        state: this.policyPathInfoPage.state ? 'Enabled' : 'Disabled',
        popAssignWans: [
          {
            popUuid: this.wanLinks[0].popUuid,
            wanUuid: this.policyPathInfoPage.masterWanUuid
          },
          {
            popUuid: this.wanLinks[1].popUuid,
            wanUuid: this.policyPathInfoPage.slaveWanUuid
          }
        ],
        type: null,
        loadBalances: null,
        apps: null
    };

    if (this.policyPathInfoPage.state) {
      infoPage.type = this.policyPathInfoPage.type;
      if (this.policyPathInfoPage.type === 'LoadBalance') {
        infoPage.loadBalances = this.policyPathInfoPage.loadBalances.map(item => {
          return {
            uuid: item.uuid,
            popUuid: item.popUuid,
            priority: item.priority ,
          };
        });
        if (infoPage.loadBalances[0].priority === infoPage.loadBalances[1].priority) {
          if (!this.policyPathInfoPage.loadBalances[0].weight || !this.policyPathInfoPage.loadBalances[1].weight) {
            this.isNullWeight = true;
            isCanSave = false;
          }else {
            infoPage.loadBalances[0].weight = this.policyPathInfoPage.loadBalances[0].weight;
            infoPage.loadBalances[1].weight = this.policyPathInfoPage.loadBalances[1].weight;
            isCanSave = true;
            this.isNullWeight = false;
          }
        }else {
          isCanSave = true;
        }
        infoPage.apps = null;
      } else {
        infoPage.apps = this.policyPathInfoPage.apps.map(item => {
          return {
            uuid: item.uuid,
            name: item.name,
            popUuid: item.popUuid,
            failover: item.failover,
            type: item.type
          };
        });
        infoPage.loadBalances = null;
        this.isStrategyPathSave = this.policyPathInfoPage.apps.filter(item => !item.nicName).length !== 0 ;
        if (!this.isStrategyPathSave) {
          isCanSave = true;
        }
      }
    }else {
      isCanSave = true;
    }

    if (isCanSave) {
      this.loadingRef.open();
      this.ceService.updateStrategyPath(infoPage, res => {
        this.policyPathInfoPage.state = res.state === 'Enabled';
        this.policyPathInfoPage.type = res.type;
        if (res.loadBalanceInventories) {this.policyPathInfoPage.loadBalances = res.loadBalanceInventories; }
        if (res.appInventories) {this.policyPathInfoPage.apps = res.appInventories.map(item => {
          if (!item.nicName) {
            item.nicName = '';
          }
          return item;
        }); }
        this.loadingRef.cancel();
        this.policyPathInfoPage.isDisabledSave = true;
      }, () => {
        this.loadingRef.cancel();
      });
    }
  }

  updateAppName(app) {
    this.selectedApp = app;
    this.updateApplicationLinkEleRf.openDialog();
  }

  openAppMonitor(current) {
    this.selectedAil = current;
    setTimeout(() => {
      this.appMonitorRef.open();
    });
  }
  /*--------------------------策略路径 ----------------------end*/

  /*--------------------------其他设置--------start*/
  getCeTunnelManageInfo() {
    this.ceService.getCeTunnelManageInfo(this.selectedCe.uuid, data => {
      if (data) {
        this.ceTunnelManageInfo = data;
        this.ceTunnelManageState = data.state === 'Enabled';
      }
    });
  }
  updateCeTunnelManageCancelDone() {
    if (this.ceTunnelManageInfo) {
      this.ceTunnelManageState = this.ceTunnelManageInfo.state === 'Enabled';
    }else {
      this.ceTunnelManageState = false;
    }
  }
  changeCeTunnelManageState(state: boolean) {
    this.ceTunnelManageState = state;
    this.updateCeTunnelManageOption.title = state ? '开启' : '禁用';
    this.updateCeTunnelManageOption.message = `请确定是否${state ? '开启' : '禁用'}专线纳管？`;
    this.updateCeTunnelManageEleRf.open();
  }
  updateCeTunnelManageDone() {
    this.loadingRef.open();
    this.ceService.updateCeTunnelManage({uuid: this.selectedCe.uuid, state: this.ceTunnelManageState ? 'Enabled' : 'Disabled'}, data => {
      this.loadingRef.cancel();
      this.ceTunnelManageInfo = data.inventory;
    }, () => {
      this.updateCeTunnelManageCancelDone();
      this.loadingRef.cancel();
    });
  }
  /*--------------------------其他设置--------end*/
}
class DetailInfoInventory {
  lineName: string;
  endpointName: string;
  interfaceName: string;
  tunnelName: string;
  resourceUuid: string;
  endpointUuid: string;
  state: string;
  rtt: number;
  disconnectCount: number;
  loss: number;
  rttText: string;
  heartBeat: string;
  heartBeat2: string;
  haSwitchTime: string;
  localIp: string;
  vpeIp: string;
  monitorIp: string;
  vlan: string;
  vpeUuid: string;
  vpeName: string;
  manageIp: string;
  uuid: string;
  nicName: string;
  vpnPort: string;
  lineType: string;
  popPriority: string;
  tunnelType: string;
  netmask: string;
  asn: string;
}

export enum TunnelType {
  SYSCLOUD = '犀思云',
  THIRDPARTY = '第三方',
}
class DetailInfoObj {
  master: DetailInfoInventory;
  slave: DetailInfoInventory;
}
