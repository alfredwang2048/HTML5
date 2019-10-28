import {Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QueryObject } from '../../base/api';
import { CeDetailComponent } from '../ce/ce-detail/ce-detail.component';
import { CeService, VpeService } from '../../shared/sdwan';
import { TunnelService } from '../../shared/tunnel';
import { TopoModel } from '../../m-common/topo/topo.component';

@Component({
  selector: 'app-network-topo',
  templateUrl: './network-topo.component.html',
  styleUrls: ['./network-topo.component.styl']
})
export class NetworkTopoComponent implements OnInit {
  topoModel = new TopoModel();
  selectedPopInfos;
  @ViewChild('detail')
  detail: CeDetailComponent;
  networkName: string;
  disabled = false;
  constructor(private route: ActivatedRoute, private ceService: CeService, private vpeService: VpeService, private tunnelService: TunnelService) {
  }

  ngOnInit() {
    this.networkName = this.route.snapshot.queryParams.name;
    this.updateTopo();
  }
  updateTopo() {
    const qobj = new QueryObject();
    const uuid = this.route.snapshot.params.uuid;
    qobj.conditions = [{name: 'sdwanNetworkUuid', op: '=', value: uuid}];
    this.disabled = true;
    this.ceService.query(qobj, (ces) => {
      const vpeUuids = [],
        pointUuids = [];
      this.disabled = false;
      ces.forEach(ce => {
        ce.color = ce.frpStatus === 'online' ? '#36ab60' : '#d9534f';
        ce.iconClass = 'icon-cpe';
        ce.topoType = 'out';
        ce.popInfos.forEach(info => {
          if (info.vpeUuid && vpeUuids.indexOf(info.vpeUuid) === -1) {
            vpeUuids.push(info.vpeUuid);
          }
          if (info.lineType === 'TUNNEL' && info.tunnelType === 'SYSCLOUD' && pointUuids.indexOf(info.endpointUuid) === -1) {
            pointUuids.push(info.endpointUuid);
          }
          if (info.haType === 'Master' && info.localIp) {
            ce.ceMasterIp = info.localIp;
          }
        });
      });
      qobj.conditions = [{name: 'uuid', op: 'in', value: vpeUuids.join(',')}];
      qobj.fields = ['uuid', 'name'];
      this.vpeService.query(qobj, (vpes) => {
        vpes.forEach(vpe => {
          vpe.color = '#36ab60';
          vpe.iconClass = 'icon-server';
          vpe.topoType = 'in';
        });
        qobj.conditions = [{name: 'uuid', op: 'in', value: pointUuids.join(',')}];
        qobj.fields = null;
        this.tunnelService.queryL3Endpoint(qobj, (datas) => {
          const inner = vpes.concat(datas);
          datas.forEach(endpoint => {
            endpoint.color = '#36ab60';
            endpoint.name = endpoint.endpointName;
            endpoint.iconClass = 'icon-switch';
            endpoint.topoType = 'in';
          });
          this.topoModel.links = [];
          this.topoModel.nodes = ces.concat(inner as any);
          inner.forEach(vpe => {
            let masterNum = 0;
            ces.forEach((ce, index) => {
              ce.popInfos.forEach((popInfo) => {
                if (popInfo.vpeUuid === vpe.uuid || popInfo.endpointUuid === vpe.uuid) {
                  const isMaster = popInfo.haType === 'Master';
                  const isSlave = popInfo.haType === 'Slave';
                  if (isMaster) {
                    masterNum ++;
                  }
                  if (isSlave) {
                    ce.slaveVpeIndex = index;
                  }
                  this.topoModel.links.push({
                    name: isMaster ? '主' : '备',
                    dash: true,
                    lineColor: isMaster ? (popInfo.status === 'Connected' ? '#36ab60' : '#d9534f') : '#ddd',
                    nodeAModel: ce,
                    nodeBModel: vpe
                  });
                }
              });
            });
            vpe.masterOfCpeNum = masterNum;
          });
          this.topoModel.containers = [{
            iconClass: 'icon-network',
            type: 'circle',
            color: '#00c1e0',
            nodeModels: inner
          }];
        });
      });
    }, false, false);
  }
  topoClick(node) {
    if (node.topoType === 'out') {
      this.ceService.getDetail(node.uuid, (datas) => {
        this.selectedPopInfos = datas;
        const timer = setTimeout(() => {
          clearTimeout(timer);
          this.detail.open();
        }, 0);
      });
    }
  }
}
