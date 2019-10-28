import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MCommonModule} from '../m-common/m-common.module';
import {SdwanRoutingModule} from './sdwan-routing.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { DragulaModule } from 'ng2-dragula';

import {NetworkComponent} from './network/network.component';
import {CeComponent} from './ce/ce.component';
import {CeCreateComponent} from './ce/ce-create/ce-create.component';
import {CeSearchComponent} from './ce/ce-search/ce-search.component';
import {VpeComponent} from './vpe/vpe.component';
import {VpeCreatComponent} from './vpe/vpe-creat/vpe-creat.component';
import {NetworkUpdateComponent} from './network/network-update/network-update.component';
import {NetworkCreateComponent} from './network/network-create/network-create.component';
import { VpeSearchComponent } from './vpe/vpe-search/vpe-search.component';
import { VpeDetailComponent } from './vpe/vpe-detail/vpe-detail.component';
import { VpeUpdateComponent } from './vpe/vpe-update/vpe-update.component';
import { VpeSetNetworkComponent } from './vpe/vpe-set-network/vpe-set-network.component';
import { VpeSetNetworkCreateComponent } from './vpe/vpe-set-network-create/vpe-set-network-create.component';
import { NetworkSearchComponent } from './network/network-search/network-search.component';
import { AssignVpeComponent } from './network/assign-vpe/assign-vpe.component';
import { NetworkDetailComponent } from './network/network-detail/network-detail.component';
import { AppointVpeComponent } from './network/appoint-vpe/appoint-vpe.component';
import { VpeInterfaceComponent } from './vpe/vpe-interface/vpe-interface.component';
import { VpeInterfaceCreateComponent } from './vpe/vpe-interface-create/vpe-interface-create.component';
import { CeUpdateComponent } from './ce/ce-update/ce-update.component';
import { CeServiceCidrComponent } from './ce/ce-service-cidr/ce-service-cidr.component';
import { CeDetailComponent } from './ce/ce-detail/ce-detail.component';
import { CeUpdateWanComponent } from './ce/ce-update-wan/ce-update-wan.component';
import { CeUpdateTunnelComponent } from './ce/ce-update-tunnel/ce-update-tunnel.component';
import { CeUpdateTunnelSdwanComponent } from './ce/ce-update-tunnel-sdwan/ce-update-tunnel-sdwan.component';
import { CeUpdateLanComponent } from './ce/ce-update-lan/ce-update-lan.component';
import { CeUpdateBandwidthComponent } from './ce/ce-update-bandwidth/ce-update-bandwidth.component';
import { VpePublicNetworkTypePipe } from './vpe/pipe/vpe-public-network-type.pipe';
import { LinkMonitorComponent } from './link-monitor/link-monitor.component';
import { LinkMonitorSearchComponent } from './link-monitor/link-monitor-search/link-monitor-search.component';
import { LinkMonitorDetailComponent } from './link-monitor/link-monitor-detail/link-monitor-detail.component';
import { MonitorChartComponent } from './link-monitor/monitor-chart/monitor-chart.component';
import { CpeMointorComponent } from './ce/cpe-mointor/cpe-mointor.component';
import { SingleMointorComponent } from './ce/single-mointor/single-mointor.component';
import { CeUpdateVpnTypeComponent } from './ce/ce-update-vpn-type/ce-update-vpn-type.component';
import { PublicNetworkMonitorComponent } from './public-network-monitor/public-network-monitor.component';
import {PublicNetworkMonitorSearchComponent} from './public-network-monitor/public-network-monitor-search/public-network-monitor-search.component';
import { CeUpdateLineComponent } from './ce/ce-update-line/ce-update-line.component';
import {VpePeInterfaceComponent} from './vpe-pe-interface/vpe-pe-interface.component';
import {VpePeSearchComponent} from './vpe-pe-interface/vpe-pe-search/vpe-pe-search.component';
import {VpePeDetailComponent} from './vpe-pe-interface/vpe-pe-detail/vpe-pe-detail.component';
import {PublicNetworkMonitorChartComponent} from './public-network-monitor/monitor-chart/monitor-chart.component';
import {HaComponent} from './ha/ha.component';
import {HaCreateComponent} from './ha/ha-create/ha-create.component';
import {HaUpdateComponent} from './ha/ha-update/ha-update.component';
import { StockComponent } from './stock/stock.component';
import { StockCreateComponent } from './stock/stock-create/stock-create.component';
import { StockSearchComponent } from './stock/stock-search/stock-search.component';
import { StockAttachComponent } from './stock/stock-attach/stock-attach.component';
import { StockDetailComponent } from './stock/stock-detail/stock-detail.component';
import { HaSearchComponent } from './ha/ha-search/ha-search.component';
import { HaDetailComponent } from './ha/ha-detail/ha-detail.component';
import { CeUpdateConnectionModeComponent } from './ce/ce-update-connection-mode/ce-update-connection-mode.component';
import { CpeMonitorManageComponent } from './ce/cpe-monitor-manage/cpe-monitor-manage.component';
import { CeTaskMonitorComponent } from './ce/ce-task-monitor/ce-task-monitor.component';
import { CeAgentVersionComponent } from './ce-agent-version/ce-agent-version.component';
import { CeAgentVersionAddComponent } from './ce-agent-version/ce-agent-version-add/ce-agent-version-add.component';
import { CeAgentVersionUpdateComponent } from './ce-agent-version/ce-agent-version-update/ce-agent-version-update.component';
import { CeAgentVersionSearchComponent } from './ce-agent-version/ce-agent-version-search/ce-agent-version-search.component';
import { CpeUpdateAgentVersionComponent } from './ce/cpe-update-agent-version/cpe-update-agent-version.component';
import { CeModelComponent } from './ce-model/ce-model.component';
import { CeModelDetailComponent } from './ce-model/ce-model-detail/ce-model-detail.component';
import {BatchServiceCidrListComponent} from './ce/batch-service-cidr-list/batch-service-cidr-list.component';
import {BatchServiceCidrCreateComponent} from './ce/batch-service-cidr-create/batch-service-cidr-create.component';
import {BatchTargetCidrCreateComponent} from './ce/batch-target-cidr-create/batch-target-cidr-create.component';
import {BatchTargetCidrListComponent} from './ce/batch-target-cidr-list/batch-target-cidr-list.component';
import { BatchRouteListComponent } from './ce/batch-route-list/batch-route-list.component';
import { BatchRouteCreateComponent } from './ce/batch-route-create/batch-route-create.component';
import {FirewallListComponent} from './ce/firewall-list/firewall-list.component';
import { FirewallCreateComponent } from './ce/firewall-create/firewall-create.component';
import { OverviewComponent } from './overview/overview.component';
import { NetworkTopoComponent } from './network-topo/network-topo.component';
import { HaBatchCidrListComponent } from './ha/ha-batch-cidr-list/ha-batch-cidr-list.component';
import { HaBatchCidrCreateComponent } from './ha/ha-batch-cidr-create/ha-batch-cidr-create.component';
import {QosListComponent} from './ce/qos-list/qos-list.component';
import {QosCreateComponent} from './ce/qos-create/qos-create.component';
import {QosBandwidthComponent} from './ce/qos-bandwidth/qos-bandwidth.component';
import { RyuMonitorComponent } from './ryu-monitor/ryu-monitor.component';
import {CeResourceQuotaComponent} from './ce/ce-resource-quota/ce-resource-quota.component';
import {HaResourceQuotaComponent} from './ha/ha-resource-quota/ha-resource-quota.component';
import {CeAddApplicationLinkComponent} from './ce/ce-add-application-link/ce-add-application-link.component';
import {CeApplicationLinkDetailListComponent} from './ce/ce-application-link-detail-list/ce-application-link-detail-list.component';
import {CeApplicationLinkDetailAddComponent} from './ce/ce-application-link-detail-add/ce-application-link-detail-add.component';
import {CeUpdateApplicationLinkComponent} from './ce/ce-update-application-link/ce-update-application-link.component';
import {NetworkAddAppModelComponent} from './network/network-add-app-model/network-add-app-model.component';
import {CeDhcpLeaseComponent} from './ce/ce-dhcp-lease/ce-dhcp-lease.component';
import {AppMointorComponent} from './ce/app-mointor/app-mointor.component';
import {SystemMointorComponent} from './ce/system-mointor/system-mointor.component';
import {networkUpdateApplicationName} from './network/network-update-application-name/network-update-application-name';
import {CeSwitchSdwanNetworkComponent} from './ce/ce-switch-sdwan-network/ce-switch-sdwan-network';
import {CeUpdateOspfComponent} from './ce/ce-update-ospf/ce-update-ospf.component';
import {CeUpdateBfdComponent} from './ce/ce-update-bfd/ce-update-bfd.component';
import { CpeCityListComponent } from './overview/cpe-city-list/cpe-city-list.component';
import {CeSdwanMointorComponent} from './ce/ce-sdwan-mointor/ce-sdwan-mointor.component';
import {CeOpenQosPoplossComponent} from './ce/ce-open-qos-poploss/ce-open-qos-poploss.component';
import {CeChangePopTypeComponent} from './ce/ce-change-pop-type/ce-change-pop-type.component';

@NgModule({
  imports: [
    CommonModule,
    SdwanRoutingModule,
    MCommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxEchartsModule,
    DragulaModule
  ],

  declarations: [
    NetworkComponent,
    CeComponent,
    CeCreateComponent,
    CeSearchComponent,
    VpeComponent,
    VpeCreatComponent,
    NetworkUpdateComponent,
    NetworkCreateComponent,
    VpeSearchComponent,
    VpeDetailComponent,
    VpeUpdateComponent,
    VpeSetNetworkComponent,
    VpeSetNetworkCreateComponent,
    NetworkSearchComponent,
    AssignVpeComponent,
    NetworkDetailComponent,
    AppointVpeComponent,
    VpeInterfaceComponent,
    VpeInterfaceCreateComponent,
    CeUpdateComponent,
    CeServiceCidrComponent,
    CeDetailComponent,
    CeUpdateWanComponent,
    CeUpdateTunnelComponent,
    CeUpdateTunnelSdwanComponent,
    CeUpdateLanComponent,
    CeUpdateBandwidthComponent,
    VpePublicNetworkTypePipe,
    LinkMonitorComponent,
    LinkMonitorSearchComponent,
    LinkMonitorDetailComponent,
    MonitorChartComponent,
    CpeMointorComponent,
    SingleMointorComponent,
    CeUpdateVpnTypeComponent,
    PublicNetworkMonitorComponent,
    PublicNetworkMonitorSearchComponent,
    CeUpdateLineComponent,
    VpePeInterfaceComponent,
    VpePeSearchComponent,
    VpePeDetailComponent,
    PublicNetworkMonitorChartComponent,
    HaComponent,
    HaCreateComponent,
    HaUpdateComponent,
    StockComponent,
    StockCreateComponent,
    StockSearchComponent,
    StockAttachComponent,
    StockDetailComponent,
    HaSearchComponent,
    HaDetailComponent,
    CeUpdateConnectionModeComponent,
    BatchServiceCidrListComponent,
    BatchServiceCidrCreateComponent,
    BatchTargetCidrListComponent,
    BatchTargetCidrCreateComponent,
    BatchRouteListComponent,
    BatchRouteCreateComponent,
    CpeMonitorManageComponent,
    CeTaskMonitorComponent,
    CeAgentVersionComponent,
    CeAgentVersionAddComponent,
    CeAgentVersionUpdateComponent,
    CeAgentVersionSearchComponent,
    CpeUpdateAgentVersionComponent,
    CeModelComponent,
    CeModelDetailComponent,
    FirewallListComponent,
    FirewallCreateComponent,
    OverviewComponent,
    NetworkTopoComponent,
    HaBatchCidrListComponent,
    HaBatchCidrCreateComponent,
    QosListComponent,
    QosCreateComponent,
    QosBandwidthComponent,
    RyuMonitorComponent,
    CeResourceQuotaComponent,
    HaResourceQuotaComponent,
    CeAddApplicationLinkComponent,
    CeApplicationLinkDetailListComponent,
    CeApplicationLinkDetailAddComponent,
    CeUpdateApplicationLinkComponent,
    NetworkAddAppModelComponent,
    CeDhcpLeaseComponent,
    AppMointorComponent,
    SystemMointorComponent,
    networkUpdateApplicationName,
    CeSwitchSdwanNetworkComponent,
    CeUpdateOspfComponent,
    CeUpdateBfdComponent,
    CpeCityListComponent,
    CeSdwanMointorComponent,
    CeOpenQosPoplossComponent,
    CeChangePopTypeComponent
  ]
})
export class SdwanModule {
}
