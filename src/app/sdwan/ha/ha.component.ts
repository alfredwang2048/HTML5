import {Component, OnInit, ViewChild} from '@angular/core';
import {QueryObject} from '../../base';
import {PageSize} from '../../model';
import {CeService, HaService} from '../../shared/sdwan';
import {CommonWindowComponent} from '../../m-common/common-window/common-window.component';
import {LoadingWindowComponent} from '../../m-common/loading-window/loading-window.component';
import {arrayUpdateItem} from '../../model/utils';
import {HaDetailComponent} from './ha-detail/ha-detail.component';
import {HaUpdateComponent} from './ha-update/ha-update.component';
import {TunnelService} from '../../shared/tunnel';
import {Router} from '@angular/router';
import {HaSearchComponent} from './ha-search/ha-search.component';

@Component({
  selector: 'app-ha',
  templateUrl: './ha.component.html',
  styleUrls: ['./ha.component.styl']
})
export class HaComponent implements OnInit {
  gridLoading = true;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };

  has: Array<any> = [];
  selectedItem: any;
  selectedDetailIndex: number;
  searchConditions;
  currentRowIndex;
  searchInitObj: any;

  deleteCommonOption = {
    width: '500px',
    title: '删除',
    message: ''
  };

  deleteServiceCidrCommonOption = {
    width: '500px',
    title: '删除',
    message: '',
    params: null
  };

  @ViewChild('delete')
  deleteEleRf: CommonWindowComponent;
  @ViewChild('loading')
  loadingRef: LoadingWindowComponent;
  @ViewChild('detail')
  detailRef: HaDetailComponent;
  @ViewChild('update')
  updateHaRef: HaUpdateComponent;
  @ViewChild('haSearch')
  haSearchRef: HaSearchComponent;

  constructor(private haService: HaService,
              private tunnelService: TunnelService,
              private ceService: CeService,
              private router: Router) {
  }

  createCeDone(parm) {
    this.loadingRef.open();
    this.haService.create(parm, () => {
      this.loadingRef.cancel();
      this.search();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  updateHaOpen() {
    this.updateSelectedHa('update');
    this.updateHaRef.reset();
    this.updateHaRef.dialogOptions.visible = true;
  }

  updateDone(parm) {
    this.loadingRef.open();
    this.haService.update(parm, (data) => {
      this.loadingRef.cancel();
      setTimeout(() => {
        this.search();
      }, 100);
    }, () => {
      this.loadingRef.cancel();
    });
  }

  deleteDone() {
    this.loadingRef.open();
    this.haService.delete(this.selectedItem, () => {
      this.loadingRef.cancel();
      arrayUpdateItem(this.has, this.selectedItem, 'delete');
    }, () => {
      this.loadingRef.cancel();
    });
  }

  openDeleteWin(detail, index) {
    this.selectedDetailIndex = index;
    this.deleteCommonOption.message = `删除操作不可恢复，请确认是否删除：<span class="red">${detail.name}</span> ？`;
    this.deleteEleRf.open();
  }

  searchDone(conds) {
    this.searchConditions = conds;
    this.pagination.current = 1;
    this.search();
  }

  ngOnInit() {
    this.searchInitObj = {name: '', value: ''};
    this.search();
  }

  selectedRow(data, rowIndex) {
    this.selectedItem = data;
    this.currentRowIndex = rowIndex;
  }

  showDetail(e) {
    this.selectedItem = e.rowData;
    this.updateSelectedHa('detail');
    this.detailRef.reset();
    this.detailRef.modelOption.toggle = true;
  }

  clickDone(e) {
    this.selectedItem = e.haInfos;
    /*if (e.clickName === 'setServiceCidr') {
      setTimeout(() => {
        this.cidrListRef.openDialog(e.cidrInventory);
      });
    }*/
  }

  resourceQuotaDone(params) {
    this.loadingRef.open();
    this.ceService.updateResourceQuota(params, (datas: any) => {
      this.loadingRef.cancel();
    }, () => {
      this.loadingRef.cancel();
    });
  }

  goToCpe(dataItem) {
    let url = '';
    if (dataItem.haGroupCeRefs.length === 1) {
      url = '/sdwan/cpe?name=uuid&value1=' + dataItem.haGroupCeRefs[0].ceUuid;
      this.router.navigateByUrl(url);
    }
    if (dataItem.haGroupCeRefs.length === 2) {
      url = '/sdwan/cpe?name=uuid&value1=' + dataItem.haGroupCeRefs[0].ceUuid + '&value2=' + dataItem.haGroupCeRefs[1].ceUuid;
      this.router.navigateByUrl(url);
    }
  }

  search() {
    this.has = [];
    this.gridLoading = false;
    this.pagination.show = false;
    const qobj = new QueryObject();
    qobj.conditions = this.searchConditions;
    qobj.start = (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    this.has = [];
    this.gridLoading = true;
    const sub = this.haService.query(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.has = datas;
      this.has.forEach((item) => {
        item['showSetCidr'] = false;
        if (item.haGroupCeRefs.length === 1) {
          item['showSetCidr'] = item.haGroupCeRefs[0].ce.l3Protocol === 'BGP';
          this.dealListData(item.haGroupCeRefs[0].ce);
        }
        if (item.haGroupCeRefs.length === 2) {
          item['showSetCidr'] = item.haGroupCeRefs[0].ce.l3Protocol === 'BGP' && item.haGroupCeRefs[1].ce.l3Protocol === 'BGP';
          this.dealListData(item.haGroupCeRefs[0].ce);
          this.dealListData(item.haGroupCeRefs[1].ce);
        }
      });
      if (total) {
        this.pagination.total = total;
        this.pagination.show = true;
      } else {
        this.pagination.show = false;
      }
    }, true, true);
  }

  dealListData(ce) {
    const endpointUuids = [];
    const resourceUuids = [];
    if (ce.connectionType === 'SDWAN') {
      ce.popInfos.forEach((i) => {
        if (i.haType === 'Master') {
          ce.masterState = i.status;
          if (i.lineType === 'TUNNEL') {
            ce.masterLineName = '专线';
          } else {
            ce.masterLineName = '公网';
          }
          if (i.rtt !== undefined) {
            ce.masterRtt = i.rtt;
          }
          if (i.endpointUuid) {
            ce.masterEndpointUuid = i.endpointUuid;
            endpointUuids.push(i.endpointUuid);
          }
        } else {
          ce.slaveState = i.status;
          if (i.lineType === 'TUNNEL') {
            ce.slaveLineName = '专线';
          } else {
            ce.slaveLineName = '公网';
          }
          if (i.rtt !== undefined) {
            ce.slaveRtt = i.rtt;
          }
          if (i.endpointUuid) {
            ce.slaveEndpointUuid = i.endpointUuid;
            endpointUuids.push(i.endpointUuid);
          }
        }
      });
    } else {
      ce.popInfos.forEach((i) => {
        if (i.haType === 'Master') {
          ce.masterState = i.status;
          if (i.lineType === 'TUNNEL') {
            ce.masterLineName = '专线';
          } else {
            ce.masterLineName = '公网';
          }
          if (i.rtt !== undefined) {
            ce.masterRtt = i.rtt;
          }
          if (i.resourceUuid && i.endpointUuid) {
            ce.masterResourceUuid = i.resourceUuid;
            ce.masterResourceEndpointUuid = i.endpointUuid;
            resourceUuids.push(i.resourceUuid);
          }
        } else {
          ce.slaveState = i.status;
          if (i.lineType === 'TUNNEL') {
            ce.slaveLineName = '专线';
          } else {
            ce.slaveLineName = '公网';
          }
          if (i.rtt !== undefined) {
            ce.slaveRtt = i.rtt;
          }
          if (i.resourceUuid && i.endpointUuid) {
            ce.slaveResourceUuid = i.resourceUuid;
            ce.slaveResourceEndpointUuid = i.endpointUuid;
            resourceUuids.push(i.resourceUuid);
          }
        }
      });
    }
    // if (endpointUuids.length !== 0) {
    //   const qobj = new QueryObject();
    //   qobj.addCondition({name: 'uuid', op: 'in', value: endpointUuids.join(',')});
    //   const sub = this.tunnelService.queryL3Endpoint(qobj, (endpoints) => {
    //     sub.unsubscribe();
    //     endpoints.forEach((i) => {
    //       if (ce.masterEndpointUuid && ce.masterEndpointUuid === i.uuid) {
    //         ce.masterEndpointName = i.endpointName;
    //       }
    //       if (ce.slaveEndpointUuid && ce.slaveEndpointUuid === i.uuid) {
    //         ce.slaveEndpointName = i.endpointName;
    //       }
    //     });
    //   });
    // }
    // if (resourceUuids.length !== 0) {
    //   const qobj = new QueryObject();
    //   qobj.addCondition({name: 'uuid', op: 'in', value: resourceUuids.join(',')});
    //   const sub = this.tunnelService.query(qobj, (tunnels) => {
    //     sub.unsubscribe();
    //     tunnels.forEach((i) => {
    //       if (ce.masterResourceUuid && ce.masterResourceUuid === i.uuid) {
    //         i.tunnelSwitchs.forEach((j) => {
    //           if (j.endpointUuid === ce.masterResourceEndpointUuid) {
    //             ce.masterEndpointName = j.endpointName;
    //           }
    //         });
    //       }
    //       if (ce.slaveResourceUuid && ce.slaveResourceUuid === i.uuid) {
    //         i.tunnelSwitchs.forEach((j) => {
    //           if (j.endpointUuid === ce.slaveResourceEndpointUuid) {
    //             ce.slaveEndpointName = j.endpointName;
    //           }
    //         });
    //       }
    //     });
    //   });
    // }
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

  updateSelectedHa(dialogType) {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'uuid', op: '=', value: this.selectedItem.uuid});
    qobj.limit = 10;
    const sub = this.haService.query(qobj, (datas, total) => {
      sub.unsubscribe();
      if (total) {
        datas.forEach((item) => {
          item['showSetCidr'] = false;
          if (item.haGroupCeRefs.length === 1) {
            item['showSetCidr'] = item.haGroupCeRefs[0].ce.l3Protocol === 'BGP';
            this.dealListData(item.haGroupCeRefs[0].ce);
          }
          if (item.haGroupCeRefs.length === 2) {
            item['showSetCidr'] = item.haGroupCeRefs[0].ce.l3Protocol === 'BGP' && item.haGroupCeRefs[1].ce.l3Protocol === 'BGP';
            this.dealListData(item.haGroupCeRefs[0].ce);
            this.dealListData(item.haGroupCeRefs[1].ce);
          }
        });
        datas[0].accountName = this.selectedItem.accountName;
        datas[0].company = this.selectedItem.company;
        datas[0].sdwanNetworkName = this.selectedItem.sdwanNetworkName;
        this.selectedItem = datas[0];
        arrayUpdateItem(this.has, datas[0], 'update');
      }
      if (dialogType === 'detail') {
        this.detailRef.open();
      } else  if (dialogType === 'update') {
        this.updateHaRef.open();
      }
    }, false, false);
  }

  getCpeBySdwanNetwork(e, data) {
    e.stopPropagation();
    this.searchInitObj = {name: 'sdwanNetworkUuid', value: data.sdwanNetworkUuid};
    this.haSearchRef.searchHandler();
  }
}
