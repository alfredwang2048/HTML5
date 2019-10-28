import {Component, OnInit, ViewChild} from '@angular/core';
import {QueryObject} from '../../base';
import {PageSize} from '../../model';
import {CeService} from '../../shared/sdwan/ce.service';
import {CeInventory, VpeService} from '../../shared/sdwan';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonWindowComponent} from '../../m-common/common-window/common-window.component';
import {CeServiceCidrComponent} from './ce-service-cidr/ce-service-cidr.component';
import {CeDetailComponent} from './ce-detail/ce-detail.component';
import * as Util from 'util';
import {TunnelService} from '../../shared/tunnel';
import {CpeMointorComponent} from './cpe-mointor/cpe-mointor.component';
import {LoadingWindowComponent} from '../../m-common/loading-window/loading-window.component';
import {arrayUpdateItem, timeStampRoundToString} from '../../model/utils';
import {CpeMonitorManageComponent} from './cpe-monitor-manage/cpe-monitor-manage.component';
import {CpeMonitorTaskInventory} from '../../shared/sdwan/api';
import {CeTaskMonitorComponent} from './ce-task-monitor/ce-task-monitor.component';

@Component({
  selector: 'app-ce',
  templateUrl: './ce.component.html',
  styleUrls: ['./ce.component.styl']
})
export class CeComponent implements OnInit {
  helpDocOption = {
    title: '申请CPE步骤',
    docHrefContent: [
      {text: '用户指南', link: '/docs/sdwan/CPE'},
      {text: 'CPE组网模式', link: '/docs/sdwan/cpe_access_model'},
    ],
    docContent: ['选择CPE型号', '输入地址信息', '输入使用时长'],
  };
  deleteCommonOption = {
    width: '500px',
    title: '删除',
    message: ''
  };
  forceDeleteCommonOption = {
    width: '500px',
    title: '强制删除',
    message: ''
  };
  restartCeCommonOption = {
    width: '500px',
    title: '系统重启',
    message: ''
  };
  restartCeAgentCommonOption = {
    width: '500px',
    title: 'Agent重启',
    message: ''
  };
  resetCeSecretKeyCommonOption = {
    width: '500px',
    title: '重置安全秘钥',
    message: ''
  };
  resetClientPasswordCommonOption = {
    width: '500px',
    title: '重置CPE客户端密码',
    message: ''
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
  initVpeCommonOption = {
    width: '500px',
    title: '初始化CPE',
    message: ''
  };
  switchMasterOption = {
    width: '500px',
    title: '切换主备链路',
    message: ''
  };
  changeSlaveOption = {
    width: '500px',
    title: '变更备链路',
    message: ''
  };
  deleteMonitorTaskCommonOption = {
    width: '500px',
    title: '删除',
    message: '',
    params: null
  };
  @ViewChild('delete')
  deleteEleRf: CommonWindowComponent;
  @ViewChild('forceDelete')
  forceDeleteEleRf: CommonWindowComponent;
  @ViewChild('disable')
  disableEleRf: CommonWindowComponent;
  @ViewChild('enable')
  enableEleRf: CommonWindowComponent;
  @ViewChild('serviceCidr')
  serviceCidrEleRf: CeServiceCidrComponent;
  @ViewChild('detail')
  detailRef: CeDetailComponent;
  @ViewChild('init')
  initEleRf: CommonWindowComponent;
  @ViewChild('cpeMonitor')
  cpeMonitorRef: CpeMointorComponent;
  @ViewChild('loading')
  loadingRef: LoadingWindowComponent;
  @ViewChild('switchMaster')
  switchMasterRef: CommonWindowComponent;
  @ViewChild('changeSlave')
  changeSlaveRef: CommonWindowComponent;
  @ViewChild('cpeMonitorManage')
  cpeMonitorManageEleRf: CpeMonitorManageComponent;
  @ViewChild('deleteMonitorTask')
  deleteMonitorTaskEleRf: CommonWindowComponent;
  @ViewChild('cpeMonitorTask')
  cpeMonitorTaskEleRef: CeTaskMonitorComponent;
  @ViewChild('restartCe')
  restartCeRf: CommonWindowComponent;
  @ViewChild('restartCeAgent')
  restartCeAgentRf: CommonWindowComponent;
  @ViewChild('resetCeSecretKey')
  resetCeSecretKeyEleRf: CommonWindowComponent;
  @ViewChild('resetClientPassword')
  resetClientPasswordEleRf: CommonWindowComponent;

  ces: Array<any> = [];
  gridLoading = true;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  selectedCe: CeInventory;
  selectedCpeMonitorTask: CpeMonitorTaskInventory;
  ceInfos: any;
  selectedDetailIndex: number;
  searchConditions;
  currentRowIndex;
  searchInitObj: any;
  searchInitObj2: any;

  constructor(private ceService: CeService,
              private activatedRoute: ActivatedRoute,
              private tunnelService: TunnelService,
              private router: Router,
              private vpeService: VpeService,
              private routeInfo: ActivatedRoute) {
  }

  ngOnInit() {
    this.searchConditions = [];
    this.searchInitObj = {name: '', value: ''};
    this.searchInitObj2 = {otherName: '', otherValue: ''};
    const params = this.routeInfo.snapshot.queryParams;
    if (params.value1) {
      if (params.value2) {
        this.searchConditions = [{name: params.name, op: 'in', value: [params.value1, params.value2].join(',')}];
      }else {
        this.searchConditions = [{name: params.name, op: '=', value: params.value1}];
      }
    }else {
      if (!Util.isUndefined(params.value) || !Util.isUndefined(params.otherValue)) {
        if (params.otherName === 'masterStatus') {
          this.searchConditions.push({name: 'popInfos.status', op: '=', value: params.otherValue}, {name: 'popInfos.haType', op: '=', value: 'Master'});
          this.searchInitObj2 = {otherName: params.otherName, otherValue: params.otherValue};
        }
        if (params.otherName === 'slaveStatus') {
          this.searchConditions.push({name: 'popInfos.status', op: '=', value: params.otherValue}, {name: 'popInfos.haType', op: '=', value: 'Slave'});
          this.searchInitObj2 = {otherName: params.otherName, otherValue: params.otherValue};
        }
        if (params.name) {
          this.searchConditions.push({name: params.name, op: '=', value: params.value});
          this.searchInitObj = {name: params.name, value: params.value};
        }
      }
    }
    this.search();

    /*监听当前路由变化*/
    this.activatedRoute.queryParams.subscribe(event => {
      if ((event.name && event.value) || (event.otherName && event.otherValue)) {
        if (event.otherName === 'masterStatus' || event.otherName === 'slaveStatus') {
          this.searchInitObj2 = {otherName: event.otherName, otherValue: event.otherValue};
        }else {
          this.searchInitObj = {name: event.name, value: event.value};
        }
      }else {
        this.searchInitObj = {name: '', value: ''};
        this.searchInitObj2 = {otherName: '', otherValue: ''};
      }
    });
  }

  initVpe(detail, index) {
    this.selectedDetailIndex = index;
    this.initVpeCommonOption.message = `您的CPE<span class="red">${detail.name}</span>将恢复为初始状态，确认执行初始化？`;
    this.initEleRf.open();
  }

  assingDone(params) {
    this.loadingRef.open();
    this.ceService.assignVpe(params, (data) => {
      this.loadingRef.cancel();
      this.search();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  showDetail(e) {
    this.selectedCe = e.rowData;
    setTimeout(() => {
      this.detailRef.open();
    });
  }

  openDeleteWin(detail, index) {
    this.selectedDetailIndex = index;
    this.deleteCommonOption.message = `删除操作不可恢复，您确定删除CPE：<span class="red">${detail.name}</span> 吗？`;
    this.deleteEleRf.open();
  }

  openResetCeKyWin(detail, index) {
    this.selectedDetailIndex = index;
    this.resetCeSecretKeyCommonOption.message = `重置安全密钥后需要手动重启设备，确定重置吗？`;
    this.resetCeSecretKeyEleRf.open();
  }

  openForceDeleteWin(detail, index) {
    this.selectedDetailIndex = index;
    this.forceDeleteCommonOption.message = `强制删除操作不可恢复，您确定删除CPE：<span class="red">${detail.name}</span> 吗？`;
    this.forceDeleteEleRf.open();
  }

  disableCe(detail, index?) {
    this.selectedDetailIndex = index;
    this.disableCommonOption.message = `您确定禁用CPE：<span class="red">${detail.name}</span> 吗？`;
    this.disableEleRf.open();
  }

  enableCe(detail, index?) {
    this.selectedDetailIndex = index;
    this.enableCommonOption.message = `您确定启用CPE：<span class="red">${detail.name}</span> 吗？`;
    this.enableEleRf.open();
  }

  openSwitchMasterWin(detail, index) {
    this.selectedDetailIndex = index;
    this.switchMasterOption.message = `切换主备链路过程中网络将短暂中断，您确定执行切换操作吗？`;
    this.switchMasterRef.open();
  }

  openChangeSlaveWin(detail, index) {
    this.selectedDetailIndex = index;
    this.changeSlaveOption.message = `您确定CPE：<span class="red">${detail.name}</span>要变更备链路吗？</span>`;
    this.changeSlaveRef.open();
  }

  restartCeEvent(detail, index?) {
    this.selectedDetailIndex = index;
    this.restartCeCommonOption.message = `您确定重启CPE：<span class="red">${detail.name}</span>系统吗？`;
    this.restartCeRf.open();
  }

  restartCeAgentEvent(detail, index?) {
    this.selectedDetailIndex = index;
    this.restartCeAgentCommonOption.message = `您确定重启CPE：<span class="red">${detail.name}</span>的SDWAN Agent软件吗？`;
    this.restartCeAgentRf.open();
  }

  openResetClientPasswordWin(detail, index) {
    this.selectedDetailIndex = index;
    this.resetClientPasswordCommonOption.message = `请确定是否重置CPE：<span class="red">${detail.name}</span>的客户端密码？`;
    this.resetClientPasswordEleRf.open();
  }

  clickDone($event) {
    if ($event.clickName === 'updateName' || $event.clickName === 'disableDone' || $event.clickName === 'enableDone' || $event.clickName === 'changeBandwidth') {
      arrayUpdateItem(this.ces, $event.data, 'update');
    }else if ($event.clickName === 'updateWan' || $event.clickName === 'updateLine' || $event.clickName === 'updateConnectionMode') {
      this.search();
    }else if ($event.clickName === 'enable') {
      this.enableCe($event.data);
    }else if ($event.clickName === 'disable') {
      this.disableCe($event.data);
    }
  }

  updateTunnelPortDone(data) {
    if (data.type === 'Enabled') {
      this.loadingRef.open();
      this.ceService.enableTunnelPort(data.params, (res) => {
        this.loadingRef.cancel();
        if (res) {
          this.ceInfos.tunnelPortInventories.forEach((value) => {
            if (value.uuid === res.uuid) {
              value.state = res.state;
            }
          });
        }
      }, () => {
        this.loadingRef.cancel();
      });
    } else if (data.type === 'Disabled') {
      this.loadingRef.open();
      this.ceService.disablePort(data.params, (res) => {
        this.loadingRef.cancel();
        if (res) {
          this.ceInfos.tunnelPortInventories.forEach((value) => {
            if (value.uuid === res.uuid) {
              value.state = res.state;
            }
          });
        }
      }, () => {
        this.loadingRef.cancel();
      });
    }
  }

  updateTunnelSdwanPortDone(data) {
    if (data.type === 'Enabled') {
      this.loadingRef.open();
      this.ceService.enableTunnelPort(data.params, (res) => {
        this.loadingRef.cancel();
        if (res) {
          this.ceInfos.tunnelPortInventories.forEach((value) => {
            if (value.uuid === res.uuid) {
              value.state = res.state;
            }
          });
        }
      }, () => {
        this.loadingRef.cancel();
      });
    } else if (data.type === 'Disabled') {
      this.loadingRef.open();
      this.ceService.disablePort(data.params, (res) => {
        this.loadingRef.cancel();
        if (res) {
          this.ceInfos.tunnelPortInventories.forEach((value) => {
            if (value.uuid === res.uuid) {
              value.state = res.state;
            }
          });
        }
      }, () => {
        this.loadingRef.cancel();
      });
    }
  }

  cpeMonitorManageDone(data) {
    if (data.type === 'delete') {
      this.deleteMonitorTaskCommonOption.message = `请确认是否删除连续测试IP:<span class="red">${data.params.dev}</span>`;
      this.deleteMonitorTaskCommonOption.params = data.params;
      this.deleteMonitorTaskEleRf.open();
    }else if (data.type === 'monitor') {
      this.selectedCpeMonitorTask = data.params;
      setTimeout(() => {
        this.cpeMonitorTaskEleRef.open();
      });
    }
  }

  deleteMonitorTaskDone() {
    this.loadingRef.open();
    this.ceService.deleteMonitorTask(this.deleteMonitorTaskCommonOption.params.uuid, (res) => {
      this.loadingRef.cancel();
      this.cpeMonitorManageEleRf.search();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  deleteDone() {
    this.loadingRef.open();
    this.ceService.delete(this.selectedCe, () => {
      this.loadingRef.cancel();
      arrayUpdateItem(this.ces, this.selectedCe, 'delete');
    }, () => {
      this.loadingRef.cancel();
    });
  }

  forceDeleteDone() {
    this.loadingRef.open();
    this.ceService.fDelete(this.selectedCe, () => {
      this.loadingRef.cancel();
      arrayUpdateItem(this.ces, this.selectedCe, 'delete');
    }, () => {
      this.loadingRef.cancel();
    });
  }

  switchMasterDone() {
    this.loadingRef.open();
    this.ceService.switchMaster(this.selectedCe, (data) => {
      this.loadingRef.cancel();
      this.search();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  changeSlaveDone() {
    this.loadingRef.open();
    const infoPage = {
      ceUuid: this.selectedCe.uuid,
      popUuid: this.selectedCe.popInfos.filter(item => {
        return item.haType === 'Slave';
      })[0].uuid
    };
    this.ceService.changeSlave(infoPage, (data) => {
      this.loadingRef.cancel();
      arrayUpdateItem(this.ces, data, 'update');
    }, () => {
      this.loadingRef.cancel();
    });
  }

  initDone() {
    this.loadingRef.open();
    this.ceService.init(this.selectedCe, (data) => {
      this.loadingRef.cancel();
      arrayUpdateItem(this.ces, data, 'update');
    }, () => {
      this.loadingRef.cancel();
    });
  }

  disableDone() {
    this.loadingRef.open();
    this.ceService.disable(this.selectedCe, (data) => {
      this.loadingRef.cancel();
      arrayUpdateItem(this.ces, data, 'update');
      if (this.ceInfos) {
        this.ceInfos.ceInventory = data;
      }
    }, () => {
      this.loadingRef.cancel();
    });
  }

  enableDone() {
    this.loadingRef.open();
    this.ceService.enable(this.selectedCe, (data) => {
      this.loadingRef.cancel();
      arrayUpdateItem(this.ces, data, 'update');
      if (this.ceInfos) {
        this.ceInfos.ceInventory = data;
      }
    }, () => {
      this.loadingRef.cancel();
    });
  }

  restartCeDone() {
    this.loadingRef.open();
    this.ceService.restartCe(this.selectedCe, (data) => {
      this.loadingRef.cancel();
      // arrayUpdateItem(this.ces, data, 'update');
    }, () => {
      this.loadingRef.cancel();
    });
  }

  restartCeAgentDone() {
    this.loadingRef.open();
    this.ceService.restartCeAgent(this.selectedCe, (data) => {
      this.loadingRef.cancel();
      // arrayUpdateItem(this.ces, data, 'update');
    }, () => {
      this.loadingRef.cancel();
    });
  }

  disableCancelDone() {
    if (this.ceInfos) {
      this.detailRef.ceState = this.ceInfos.ceInventory.state === 'Enabled';
    }
  }

  enableCancelDone() {
    if (this.ceInfos) {
      this.detailRef.ceState = this.ceInfos.ceInventory.state === 'Enabled';
    }
  }

  resourceQuotaDone(params) {
    this.loadingRef.open();
    this.ceService.updateResourceQuota(params, (datas: any) => {
      this.loadingRef.cancel();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  switchCpeSdwanNetworkDone(infoPage) {
    this.loadingRef.open();
    this.ceService.switchCpeSdwanNetwork(infoPage, (data: any) => {
      // arrayUpdateItem(this.ces, data, 'update');
      this.search();
      this.loadingRef.cancel();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  resetCeSecretKeyDone() {
    this.loadingRef.open();
    this.ceService.resetCeKey(this.selectedCe, (data) => {
      this.loadingRef.cancel();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  changePopTypeDone(data) {
    this.loadingRef.open();
    this.ceService.changePopType(data.uuid, (res) => {
      this.loadingRef.cancel();
      this.search();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  resetClientPasswordDone() {
    this.loadingRef.open();
    this.ceService.resetClientPassword(this.selectedCe, (data) => {
      this.loadingRef.cancel();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  searchDone(conds) {
    this.searchConditions = conds;
    this.pagination.current = 1;
    this.search();
  }

  createCeDone(param) {
    this.loadingRef.open();
    this.ceService.create(param, (model) => {
      this.loadingRef.cancel();
      /*arrayUpdateItem(this.ces, model, 'add');*/
      this.search();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  selectedRow(data, rowIndex) {
    this.selectedCe = data;
    this.currentRowIndex = rowIndex;
  }

  search() {
    const qobj = new QueryObject();
    qobj.conditions = this.searchConditions;
    qobj.start = (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    this.ces = [];
    this.gridLoading = true;
    const sub = this.ceService.query(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.ces = datas;
      if (total) {
        this.pagination.total = total;
        this.pagination.show = true;
        this.dealListData();
      } else {
        this.pagination.show = false;
      }
    });
  }

  dealListData() {
    const endpointUuids = [];
    const resourceEndpointUuids = [];
    const vpeUuids = [];
    this.ces.forEach((item) => {
      item.lasterTime = timeStampRoundToString((new Date().getTime() - new Date(item.heartBeat).getTime()) / 1000);
      if (item.connectionType === 'SDWAN') {
        item.popInfos.forEach((i) => {
          if (i.haType === 'Master') {
            item.masterState = i.status;
            if (i.lineType === 'TUNNEL') {
              item.masterLineName = '专线';
            } else {
              item.masterLineName = '公网';
            }
            if (i.rtt !== undefined) {
              item.masterRtt = i.rtt;
            }
            if (i.endpointUuid) {
              item.masterEndpointUuid = i.endpointUuid;
            }
            if (i.vpeUuid) {
              item.masterVpeUuid = i.vpeUuid;
            }
          } else {
            item.slaveState = i.status;
            if (i.lineType === 'TUNNEL') {
              item.slaveLineName = '专线';
            } else {
              item.slaveLineName = '公网';
            }
            if (i.rtt !== undefined) {
              item.slaveRtt = i.rtt;
            }
            if (i.endpointUuid) {
              item.slaveEndpointUuid = i.endpointUuid;
            }
            if (i.vpeUuid) {
              item.slaveVpeUuid = i.vpeUuid;
            }
          }
          if (i.vpeUuid) {
            if (!vpeUuids.includes(i.vpeUuid)) {
              vpeUuids.push(i.vpeUuid);
            }
          }else {
            if (i.endpointUuid && !endpointUuids.includes(i.endpointUuid)) {
              endpointUuids.push(i.endpointUuid);
            }
          }
        });
      } else {
        item.popInfos.forEach((i) => {
          if (i.haType === 'Master') {
            item.masterState = i.status;
            if (i.lineType === 'TUNNEL') {
              item.masterLineName = '专线';
            } else {
              item.masterLineName = '公网';
            }
            if (i.rtt !== undefined) {
              item.masterRtt = i.rtt;
            }
            if (i.resourceUuid && i.endpointUuid) {
              item.masterResourceUuid = i.resourceUuid;
              item.masterResourceEndpointUuid = i.endpointUuid;
            }
            if (i.vpeUuid) {
              item.masterVpeUuid = i.vpeUuid;
            }
          } else {
            item.slaveState = i.status;
            if (i.lineType === 'TUNNEL') {
              item.slaveLineName = '专线';
            } else {
              item.slaveLineName = '公网';
            }
            if (i.rtt !== undefined) {
              item.slaveRtt = i.rtt;
            }
            if (i.resourceUuid && i.endpointUuid) {
              item.slaveResourceUuid = i.resourceUuid;
              item.slaveResourceEndpointUuid = i.endpointUuid;
            }
            if (i.vpeUuid) {
              item.slaveVpeUuid = i.vpeUuid;
            }
          }
          if (i.vpeUuid) {
            if (!vpeUuids.includes(i.vpeUuid)) {
              vpeUuids.push(i.vpeUuid);
            }
          }else {
            if (i.endpointUuid && !resourceEndpointUuids.includes(i.endpointUuid)) {
              resourceEndpointUuids.push(i.endpointUuid);
            }
          }
        });
      }
    });
    if (endpointUuids.length) {
      this.getL3Endpoints(endpointUuids.join(','));
    }
    if (resourceEndpointUuids.length) {
      this.getEndpoints(resourceEndpointUuids.join(','));
    }
    if (vpeUuids.length) {
      this.getVpes(vpeUuids.join(','));
    }
  }

  getVpes(uuids) {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'uuid', op: 'in', value: uuids});
    const sub = this.vpeService.query(qobj, (vpeDatas) => {
      sub.unsubscribe();
      this.ces.forEach((item) => {
        vpeDatas.forEach((i) => {
          if (item.masterVpeUuid && item.masterVpeUuid === i.uuid) {
            item.masterVpeName = i.name;
          }
          if (item.slaveVpeUuid && item.slaveVpeUuid === i.uuid) {
            item.slaveVpeName = i.name;
          }
        });
      });
    });
  }

  getL3Endpoints(uuids) {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'uuid', op: 'in', value: uuids});
    const sub = this.tunnelService.queryL3Endpoint(qobj, (endpoints) => {
      sub.unsubscribe();
      this.ces.forEach((item) => {
        endpoints.forEach((i) => {
          if (item.masterEndpointUuid && item.masterEndpointUuid === i.uuid) {
            item.masterEndpointName = i.endpointName;
          }
          if (item.slaveEndpointUuid && item.slaveEndpointUuid === i.uuid) {
            item.slaveEndpointName = i.endpointName;
          }
        });
      });
    });
  }

  getEndpoints(uuids) {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'uuid', op: 'in', value: uuids});
    const sub = this.tunnelService.queryEndpoint(qobj, (endpoints) => {
      sub.unsubscribe();
      this.ces.forEach((item) => {
        endpoints.forEach((i) => {
          if (item.masterResourceEndpointUuid && item.masterResourceEndpointUuid === i.uuid) {
            item.masterEndpointName = i.name;
          }
          if (item.slaveResourceEndpointUuid && item.slaveResourceEndpointUuid === i.uuid) {
            item.slaveEndpointName = i.name;
          }
        });
      });
    });
  }

  getCpeBySdwanNetwork(e, data) {
    e.stopPropagation();
    // this.searchInitObj = {name: 'sdwanNetworkUuid', value: data.sdwanNetworkUuid};
    this.router.navigate(['/sdwan/cpe'], {queryParams: {name: 'sdwanNetworkUuid', value: data.sdwanNetworkUuid}});
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

  isActionShow(dataItem: CeInventory, action) {
    if (dataItem) {
      if (action === 'switchMaster') {
        return dataItem.connectionType === 'SDWAN' && dataItem.status === 'online' && dataItem.configStatus === 'Config';
      } else if (action === 'configCifr') {
        return !(dataItem.configStatus === 'Config' && dataItem.state === 'Enabled' && dataItem.status === 'offline') && dataItem.connectionType !== 'TUNNEL';
      }else if (action === 'disable') {
        return dataItem.state === 'Enabled' && dataItem.configStatus !== 'Deploying';
      }else if (action === 'enable') {
        return dataItem.state === 'Disabled' && dataItem.configStatus !== 'Deploying';
      }else if (action === 'delete') {
        return dataItem.state === 'Disabled';
      }else if (action === 'fDelete') {
        return dataItem.configStatus === 'Config' && dataItem.state === 'Enabled' && dataItem.status === 'offline';
      }else if (action === 'init') {
        return dataItem.status === 'online' && dataItem.state === 'Disabled';
      }else if (action === 'assignVpn') {
        return dataItem.connectionType !== 'TUNNEL';
      }else if (action === 'restart') {
        return dataItem.status === 'online';
      }else if (action === 'restartAgent') {
        return true;
      }else if (action === 'CPEMonitorManage') {
        return dataItem.model !== 'mCPE';
      }else if (action === 'switchSdwanNetwork') {
        return dataItem.connectionType === 'SDWAN';
      }else if (action === 'resetCeSecretKey') {
        return dataItem.state === 'Disabled';
      }else if (action === 'changePopType') {
        return dataItem.state === 'Disabled';
      }else if (action === 'resetClientPassword') {
        return dataItem.os === 'vyos';
      }else {
        return true;
      }
    }
  }

  openMonitor(e: Event, ce: CeInventory) {
    e.stopPropagation();
    this.selectedCe = ce;
    setTimeout(() => {
      this.cpeMonitorRef.open();
    }, 0);
  }
}
