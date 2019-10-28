import {Component, OnInit, Input, ViewChild} from '@angular/core';
import {QueryObject} from '../../../base';
import {CeService, SdwanService} from '../../../shared/sdwan/';
import {SdwanInventory} from '../../../shared/sdwan/api';
import {PageSize} from '../../../model';
import {FirewallListComponent} from '../../ce/firewall-list/firewall-list.component';
import {FirewallInventory} from '../../../shared/sdwan';
import {CommonWindowComponent} from '../../../m-common/common-window/common-window.component';
import {LoadingWindowComponent} from '../../../m-common/loading-window/loading-window.component';
import {QosListComponent} from '../../ce/qos-list/qos-list.component';
import {arrayUpdateItem, chooseOtherFromAll} from '../../../model/utils';
import {NetworkAddAppModelComponent} from '../network-add-app-model/network-add-app-model.component';
import {CeApplicationLinkDetailListComponent} from '../../ce/ce-application-link-detail-list/ce-application-link-detail-list.component';
import {CeUpdateApplicationLinkComponent} from '../../ce/ce-update-application-link/ce-update-application-link.component';
import {networkUpdateApplicationName} from '../network-update-application-name/network-update-application-name';

@Component({
  selector: 'app-network-detail',
  templateUrl: './network-detail.component.html',
  styleUrls: ['./network-detail.component.styl']
})
export class NetworkDetailComponent implements OnInit {

  @Input()
  selectedItem: SdwanInventory;
  @ViewChild('firewallModel')
    firewallEleRf: FirewallListComponent;
  @ViewChild('deleteFirewallModel')
    deleteFirewallEleRf: CommonWindowComponent;
  @ViewChild('loading')
    loadingRef: LoadingWindowComponent;
  @ViewChild('firewallAttentionModel')
    firewallAttentionEleRf: CommonWindowComponent;
  @ViewChild('qosModel')
    qosEleRf: QosListComponent;
  @ViewChild('deleteQosModel')
    deleteQosEleRf: CommonWindowComponent;
  @ViewChild('addAppModel')
    addAppModelEleRf: NetworkAddAppModelComponent;
  @ViewChild('deleteAppModel')
    deleteAppModelEleRf: CommonWindowComponent;
  @ViewChild('ailDetailList')
    ailDetailListEleRf: CeApplicationLinkDetailListComponent;
  @ViewChild('ailDetailDelete')
    ailDetailDeleteEleRf: CommonWindowComponent;
  @ViewChild('networkUpdateApplicationName')
    networkUpdateApplicationNameEleRf: networkUpdateApplicationName;
  @ViewChild('updateSdwanTunnelManage')
    updateSdwanTunnelManageEleRf: CommonWindowComponent;

  modelOption = {
    title: 'SD-WAN网络详情',
    width: '800px',
    toggle: false
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
  updateSdwanTunnelManageOption = {
    width: '500px',
    title: '删除',
    message: '',
  };
  listManagerRoles = {
    resource: {
      businessName: null,
      projectName: null,
      customerName: null
    },
    account: {
      businessName: null,
      projectName: null,
      customerName: null
    }
  };
  currentVpe;
  currentL3network;
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
  fireWalls: Array<any> = [];
  Qoss: Array<any> = [];
  fireWallFridLoading = true;
  qosLoading = true;
  /*navTabLists = [
    {text: '设备信息', value: 'deviceInfo'},
    {text: '防火墙', value: 'fireWallInfo'},
    {text: 'QoS', value: 'Qos'},
    {text: '策略路径', value: 'policy'}
  ];*/
  navTabLists = [
    {text: '网络信息', value: 'deviceInfo'},
    {text: 'CPE预配置', value: 'other'},
    {text: '其他设置', value: 'tunnelManage'}
  ];
  currentTab = this.navTabLists[0];
  resourceQuota: any;
  appModels: Array<any>;
  app_input_box: boolean;
  selectedApps: Array<string> = [];
  accordionItems = {
    item1: false,
    item2: false,
    item3: false,
  };
  selectedAil = {
    uuid: '',
    name: ''
  };
  selectedApplication: any;
  sdwanTunnelManageInfo;
  sdwanTunnelManageState = false;

  constructor(private sdServer: SdwanService, private ceService: CeService) {
  }

  ngOnInit() {
  }

  navTabsDone(data) {
    /*  if (data.value === 'fireWallInfo') {
        this.getFirewall();
      }else if (data.value === 'Qos') {
        this.getQos();
      }else if (data.value === 'policy') {
        this.app_input_box = false;
        this.appModels = [];
        this.getPolicyInfo();
      }*/
    if (data.value === 'other') {
      this.getFirewall();
      this.getQos();
      this.app_input_box = false;
      this.appModels = [];
      this.getPolicyInfo();
    }else if (data.value === 'tunnelManage') {
      this.getSdwanTunnelManageInfo();
    }
  }

  open() {
    this.modelOption.toggle = true;
    this.listManagerRoles = {
      resource: {
        businessName: null,
        projectName: null,
        customerName: null
      },
      account: {
        businessName: null,
        projectName: null,
        customerName: null
      }
    };
    this.currentVpe = [];
    this.currentTab = this.navTabLists[0];
    this.accordionItems = {
      item1: false,
      item2: false,
      item3: false,
    };
    this.selectedAil = {
      uuid: '',
      name: ''
    };
    this.selectedApplication = null;

    /*查询已指定VPE*/
    if (this.selectedItem.distribution === 'ASSIGN') {
      this.sdServer.getListVpeForSdwan(this.selectedItem, (list) => {
        this.currentVpe = list;
      });
    }

    /*查询产品负责人*/
    const qobj = new QueryObject();
    qobj.addCondition({name: 'resourceUuid', op: '=', value: this.selectedItem.uuid});
    this.sdServer.queryResourceManagerRole(qobj, (datas) => {
      if (datas.length) {
        datas.forEach((item) => {
          if (item.managerRole === 'Business') {
            this.listManagerRoles.resource.businessName = item.userName;
          } else if (item.managerRole === 'Project') {
            this.listManagerRoles.resource.projectName = item.userName;
          } else if (item.managerRole === 'Customer') {
            this.listManagerRoles.resource.customerName = item.userName;
          }
        });
      }
    });

    /*查询账户负责人*/
    const qobj2 = new QueryObject();
    qobj2.addCondition({name: 'accountUuid', op: '=', value: this.selectedItem.accountUuid});
    this.sdServer.queryAccountManagerRole(qobj2, (datas) => {
      if (datas.length) {
        datas.forEach((item) => {
          if (item.managerRole === 'Business') {
            this.listManagerRoles.account.businessName = item.userName;
          } else if (item.managerRole === 'Project') {
            this.listManagerRoles.account.projectName = item.userName;
          } else if (item.managerRole === 'Customer') {
            this.listManagerRoles.account.customerName = item.userName;
          }
        });
      }
    });

    /*查询L3网络*/
    const qobj3 = new QueryObject();
    qobj3.addCondition({name: 'uuid', op: '=', value: this.selectedItem.l3networkUuid});
    this.sdServer.queryL3Network(qobj3, (l3) => {
      this.currentL3network = l3[0];
    });

    this.getResourceQuota();
  }

  configAppDefination(data) {
    this.selectedAil = data;
    setTimeout(() => {
      this.ailDetailListEleRf.openDialog();
    });
  }

  deleteAppDefinitionDone() {
    this.loadingRef.open();
    this.ceService.batchDeleteAppDefinition(this.deleteAppDefinitionCommonOption.params, () => {
      this.loadingRef.cancel();
      this.ailDetailListEleRf.applicationLists = chooseOtherFromAll(this.ailDetailListEleRf.applicationLists, this.deleteAppDefinitionCommonOption.params.uuids, 'uuid');
      this.ailDetailListEleRf.reset();
    }, () => {
      this.loadingRef.cancel();
    }, true);
  }

  updateApplicationLinkDone(params) {
    if (params.type === 'add') {
      this.loadingRef.open();
      this.ceService.addAppDefinition(params.data, res => {
        this.loadingRef.cancel();
        this.ailDetailListEleRf.search(true);
      }, () => {
        this.loadingRef.cancel();
      }, true);
    }else if (params.type === 'delete') {
      this.deleteAppDefinitionCommonOption.message = `请确定是否删除该应用定义？`;
      this.deleteAppDefinitionCommonOption.params = params.data;
      this.ailDetailDeleteEleRf.open();
    }
  }

  getResourceQuota() {
    this.ceService.getResourceModelQuota(datas => {
      this.resourceQuota = datas;
    });
  }

  getPolicyInfo () {
    const qobj = new QueryObject();
    qobj.sortBy = 'createDate';
    qobj.sortDirection = 'asc';
    qobj.addCondition({name: 'sdwanNetworkUuid', op: '=', value: this.selectedItem.uuid});
    this.ceService.queryAppModel(qobj, (datas) => {
      this.appModels = datas;
    });
  }

  clickAppId() {
    this.selectedApps = this.appModels.filter(item => item.status).map(it => it.uuid);
  }

  selectAllApp(value) {
    if (value) {
      this.appModels.map(item => {
        if (item.type !== 'DEFAULT') {
          item.status = true;
        }
      });
    }else {
      this.appModels.map(item => {
        item.status = false;
      });
    }
    this.clickAppId();
  }

  addAppModelDone(params) {
    this.loadingRef.open();
    this.ceService.addNetworkAppModel(params, datas => {
      this.appModels.push(datas);
      this.loadingRef.cancel();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  deleteAppModelClick() {
    this.deleteAppCommonOption.message = `请确定是否删除该应用链路？`;
    this.deleteAppModelEleRf.open();
  }

  deleteAppDone() {
    this.loadingRef.open();
    const infoPage = {
      sdwanNetworkUuid: this.selectedItem.uuid,
      uuids: this.selectedApps
    };
    this.ceService.batchDeleteApp(infoPage, () => {
      this.loadingRef.cancel();
      this.appModels = chooseOtherFromAll(this.appModels, infoPage.uuids, 'uuid');
      this.selectedApps = [];
    }, () => {
      this.loadingRef.cancel();
    }, true);
  }

  getFirewall() {
    const qobj = new QueryObject();
    qobj.start = (this.fireWallPagination.current - 1) * this.fireWallPagination.size;
    qobj.limit = this.fireWallPagination.size;
    qobj.sortBy = 'rank';
    qobj.addCondition({name: 'sdwanNetworkUuid', op: '=', value: this.selectedItem.uuid});
    this.fireWalls = [];
    this.fireWallFridLoading = true;
    const sub = this.ceService.queryFireWall(qobj, (datas, total) => {
      sub.unsubscribe();
      this.fireWallFridLoading = false;
      this.fireWalls = datas;
      this.fireWallPagination.total = total;
      this.fireWallPagination.show = total !== 0;
    }, true);
  }

  getQos() {
    const qobj = new QueryObject();
    qobj.start = (this.qosPagination.current - 1) * this.qosPagination.size;
    qobj.limit = this.qosPagination.size;
    qobj.sortBy = 'createDate';
    qobj.sortDirection = 'desc';
    qobj.addCondition({name: 'sdwanNetworkUuid', op: '=', value: this.selectedItem.uuid});
    this.Qoss = [];
    this.qosLoading = true;
    const sub = this.ceService.queryQos(qobj, (datas, total) => {
      sub.unsubscribe();
      this.qosLoading = false;
      this.Qoss = datas;
      this.qosPagination.total = total;
      this.qosPagination.show = total !== 0;
    }, true);
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
  qosPageChange(size: number, isSize: boolean) {
    if (isSize) {
      this.qosPagination.current = 1;
      this.qosPagination.size = size;
    } else {
      this.qosPagination.current = size;
    }
    this.getQos();
  }
  refreshFirewall (datas) {
    this.fireWalls = datas;
    this.fireWallPagination.total = this.fireWalls.length;
    this.fireWallPagination.show = this.fireWalls.length !== 0;
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
        /*this.refreshFirewall(rets);
        this.firewallEleRf.search();*/
        this.getFirewall();
      }, () => {
        this.loadingRef.cancel();
      }, true);
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

  qosDone(params) {
    if (params.type === 'add') {
      this.loadingRef.open();
      this.ceService.createQos(params.data, (datas) => {
        this.loadingRef.cancel();
        this.getQos();
        this.qosEleRf.search(true);
      }, () => {
        this.loadingRef.cancel();
      }, true);
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
    }, true);
  }

  accordion(item) {
    this.accordionItems[item] = !this.accordionItems[item];
  }

  updateAppName(app) {
    this.selectedApplication = app;
    this.networkUpdateApplicationNameEleRf.openDialog();
  }

  updateApplicationNameDone(params) {
    this.loadingRef.open();
    this.ceService.updateAppModel(params, datas => {
      arrayUpdateItem(this.appModels, datas, 'update');
      this.loadingRef.cancel();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  /*--------------------------其他设置--------start*/
  getSdwanTunnelManageInfo() {
    this.ceService.getSdwanTunnelManageInfo(this.selectedItem.uuid, data => {
      if (data) {
        this.sdwanTunnelManageInfo = data;
        this.sdwanTunnelManageState = data.state === 'Enabled';
      }
    });
  }
  updateSdwanTunnelManageCancelDone() {
    if (this.sdwanTunnelManageInfo) {
      this.sdwanTunnelManageState = this.sdwanTunnelManageInfo.state === 'Enabled';
    }else {
      this.sdwanTunnelManageState = false;
    }
  }
  changeSdwanTunnelManageState(state: boolean) {
    this.sdwanTunnelManageState = state;
    this.updateSdwanTunnelManageOption.title = state ? '开启' : '禁用';
    this.updateSdwanTunnelManageOption.message = `请确定是否${state ? '开启' : '禁用'}专线纳管？`;
    this.updateSdwanTunnelManageEleRf.open();
  }
  updateSdwanTunnelManageDone() {
    this.loadingRef.open();
    this.ceService.updateSdwanTunnelManage({uuid: this.selectedItem.uuid, state: this.sdwanTunnelManageState ? 'Enabled' : 'Disabled'}, data => {
      this.loadingRef.cancel();
      this.sdwanTunnelManageInfo = data.inventory;
    }, () => {
      this.updateSdwanTunnelManageCancelDone();
      this.loadingRef.cancel();
    });
  }
  /*--------------------------其他设置--------end*/
}
