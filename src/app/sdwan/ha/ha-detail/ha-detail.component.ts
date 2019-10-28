import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {CeService, HaService} from '../../../shared/sdwan';
import {CommonWindowComponent} from '../../../m-common/common-window/common-window.component';
import {chooseOtherFromAll} from '../../../model/utils';
import {LoadingWindowComponent} from '../../../m-common/loading-window/loading-window.component';
import {HaBatchCidrListComponent} from '../ha-batch-cidr-list/ha-batch-cidr-list.component';
import {QueryObject} from '../../../base';

@Component({
  selector: 'app-ha-detail',
  templateUrl: './ha-detail.component.html',
  styleUrls: ['./ha-detail.component.styl']
})
export class HaDetailComponent implements OnInit {

  @Input()
  selectedHa: any;
  @Output()
  done: EventEmitter<null> = new EventEmitter();
  @ViewChild('loading')
  loadingRef: LoadingWindowComponent;
  @ViewChild('cidrList')
  cidrListRef: HaBatchCidrListComponent;
  @ViewChild('deleteServiceCidr')
  deleteServiceCidrEleRf: CommonWindowComponent;
  modelOption = {
    title: '高可用HA组详情',
    toggle: false
  };
  deleteServiceCidrCommonOption = {
    width: '500px',
    title: '删除',
    message: '',
    params: null
  };
  width = '750px';
  ceUuidA;
  ceUuidB;
  ceNameA;
  ceNameB;
  esnA;
  esnB;
  priorityA;
  priorityB;
  cePortNameA;
  cePortNameB;
  haRoleA;
  haRoleB;
  lastModifiedTimeA;
  lastModifiedTimeB;
  localIpA;
  localIpB;
  ipCidrA;
  ipCidrB;
  cidrInventory = [];
  serviceCidrs = {
    datas: [],
    total: 0
  };
  emitData;
  resourceQuota: any;
  refreshLoadingA;
  refreshLoadingB;

  constructor(private haService: HaService, private ceService: CeService) {
  }

  ngOnInit() {
    this.cidrInventory = [];
  }

  reset() {
    this.ceUuidA = null;
    this.ceUuidB = null;
    this.ceNameA = null;
    this.ceNameB = null;
    this.esnA = null;
    this.esnB = null;
    this.cePortNameA = null;
    this.cePortNameB = null;
    this.priorityA = null;
    this.priorityB = null;
    this.haRoleA = null;
    this.haRoleB = null;
    this.lastModifiedTimeA = null;
    this.lastModifiedTimeB = null;
    this.localIpA = null;
    this.localIpB = null;
    this.ipCidrA = null;
    this.ipCidrB = null;
    this.cidrInventory = [];
    this.serviceCidrs = {
      datas: [],
      total: 0
    };
    this.refreshLoadingA = false;
    this.refreshLoadingB = false;
  }

  open() {
    this.reset();
    this.modelOption.toggle = true;

    const ceUuids = [];
    if (this.selectedHa.haGroupCeRefs[0]) {
      this.ceUuidA = this.selectedHa.haGroupCeRefs[0].ceUuid;
      this.ceNameA = this.selectedHa.haGroupCeRefs[0].ceName;
      this.esnA = this.selectedHa.haGroupCeRefs[0].ce.esn;
      if (this.selectedHa.haGroupCeRefs[0].nic === 'br0') {
        this.cePortNameA = 'br0(LAN)';
        ceUuids.push(this.ceUuidA);
      } else {
        this.cePortNameA = this.selectedHa.haGroupCeRefs[0].nic + '(WAN)';
        this.getCePort(this.ceUuidA, this.selectedHa.haGroupCeRefs[0].nic);
      }
    }
    if (this.selectedHa.haGroupCeRefs[1]) {
      this.ceUuidB = this.selectedHa.haGroupCeRefs[1].ceUuid;
      this.ceNameB = this.selectedHa.haGroupCeRefs[1].ceName;
      this.esnB = this.selectedHa.haGroupCeRefs[1].ce.esn;
      if (this.selectedHa.haGroupCeRefs[1].nic === 'br0') {
        this.cePortNameB = 'br0(LAN)';
        ceUuids.push(this.ceUuidB);
      } else {
        this.cePortNameB = this.selectedHa.haGroupCeRefs[1].nic + '(WAN)';
        this.getCePort(this.ceUuidB, this.selectedHa.haGroupCeRefs[1].nic);
      }
    }

    if (this.selectedHa.haGroupCeRefs.length) {
      this.selectedHa.haGroupCeRefs.forEach((item) => {
        if (item.ceUuid === this.ceUuidA) {
          this.priorityA = item.priority;
          this.haRoleA = item.haRole;
          this.lastModifiedTimeA = item.lastModifiedTime;
        }
        if (item.ceUuid === this.ceUuidB) {
          this.priorityB = item.priority;
          this.haRoleB = item.haRole;
          this.lastModifiedTimeB = item.lastModifiedTime;
        }
      });
    }
    if (ceUuids.length) {
      this.getLanInfo(ceUuids);
    }
    /*if (data.serviceCidrInventory) {
      this.cidrInventory = data.serviceCidrInventory;
    }*/
    this.getServiceCidr();
  }

  getCePort(uuid, name) {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'ceUuid', op: '=', value: uuid});
    qobj.addCondition({name: 'name', op: '=', value: name});
    this.haService.queryCePort(qobj, (cePorts) => {
      if (cePorts[0].ceUuid === this.ceUuidA) {
        this.ipCidrA = cePorts[0].ipCidr;
      } else if (cePorts[0].ceUuid === this.ceUuidB) {
        this.ipCidrB = cePorts[0].ipCidr;
      }
    });
  }

  getLanInfo(ceUuids) {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'uuid', op: 'in', value: ceUuids.join(',')});
    this.haService.queryLanInfo(qobj, (lanInfos) => {
      lanInfos.forEach((item) => {
        if (item.uuid === this.ceUuidA) {
          this.localIpA = item.localIp;
        } else if (item.uuid === this.ceUuidB) {
          this.localIpB = item.localIp;
        }
      });
    });
  }

  getResourceQuota() {
    this.ceService.getResourceQuota(this.selectedHa.uuid, 'HaGroupVO', datas => {
      this.resourceQuota = datas;
    });
  }

  getServiceCidr() {
    const qobj = new QueryObject();
    qobj.start = 0;
    qobj.limit = 10;
    qobj.sortBy = 'createDate';
    qobj.sortDirection = 'desc';
    qobj.addCondition({name: 'resourceUuid', op: '=', value: this.selectedHa.uuid});
    qobj.addCondition({name: 'resourceType', op: '=', value: 'HaGroupVO'});
    const sub = this.ceService.queryServiceCidr(qobj, (datas, total) => {
      sub.unsubscribe();
      this.serviceCidrs.datas = datas;
      this.serviceCidrs.total = total;
    });
  }

  batchCidrDone(params) {
    if (params.type === 'add') {
      this.loadingRef.open();
      this.haService.createServiceCidr(params.data, (datas) => {
        this.loadingRef.cancel();
        this.serviceCidrs.datas.unshift(...datas);
        this.cidrListRef.search(true);
      }, () => {
        this.loadingRef.cancel();
      });
    } else if (params.type === 'delete') {
      this.deleteServiceCidrCommonOption.message = `请确认是否删除该业务网段?`;
      this.deleteServiceCidrCommonOption.params = params.data;
      this.deleteServiceCidrEleRf.open();
    }
  }

  deleteServiceCidrDone() {
    this.loadingRef.open();
    this.haService.deleteServiceCidr(this.deleteServiceCidrCommonOption.params, (res) => {
      this.loadingRef.cancel();
      this.serviceCidrs.datas = chooseOtherFromAll(this.serviceCidrs.datas, this.deleteServiceCidrCommonOption.params.uuids, 'uuid');
      this.cidrListRef.serviceCidrs = chooseOtherFromAll(this.cidrListRef.serviceCidrs, this.deleteServiceCidrCommonOption.params.uuids, 'uuid');
      this.cidrListRef.reset();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  refreshRole(roleType) {
    if (roleType === 'roleA') {
      this.refreshLoadingA = true;
      this.haService.syncHaInfoFromClient(this.selectedHa.haGroupCeRefs[0].ceUuid, (data) => {
        this.refreshLoadingA = false;
        this.haRoleA = data.haRole;
        this.selectedHa.haGroupCeRefs[0].haRole = data.haRole;
      }, () => {
        this.refreshLoadingA = false;
      });
    }else if (roleType === 'roleB') {
      this.refreshLoadingB = true;
      this.haService.syncHaInfoFromClient(this.selectedHa.haGroupCeRefs[1].ceUuid, (data) => {
        this.refreshLoadingB = false;
        this.haRoleB = data.haRole;
        this.selectedHa.haGroupCeRefs[1].haRole = data.haRole;
      }, () => {
        this.refreshLoadingB = false;
      });
    }
  }

  // setServiceCidr() {
  //   this.emitData = {
  //     haInfos: this.selectedHa,
  //     clickName: 'setServiceCidr',
  //     cidrInventory: this.cidrInventory
  //   };
  //   this.done.emit(this.emitData);
  // }

  openCidrList() {
    this.getResourceQuota();
    this.cidrListRef.openDialog();
  }

  close() {
    this.modelOption.toggle = false;
  }

}
