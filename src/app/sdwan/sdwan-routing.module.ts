import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NetworkComponent} from './network/network.component';
import {VpeComponent} from './vpe/vpe.component';
import {CeComponent} from './ce/ce.component';
import {LinkMonitorComponent} from './link-monitor/link-monitor.component';
import {PublicNetworkMonitorComponent} from './public-network-monitor/public-network-monitor.component';
import {VpePeInterfaceComponent} from './vpe-pe-interface/vpe-pe-interface.component';
import {HaComponent} from './ha/ha.component';
import {StockComponent} from './stock/stock.component';
import {CeAgentVersionComponent} from './ce-agent-version/ce-agent-version.component';
import {CeModelComponent} from './ce-model/ce-model.component';
import {OverviewComponent} from './overview/overview.component';
import { NetworkTopoComponent } from './network-topo/network-topo.component';
import { RyuMonitorComponent } from './ryu-monitor/ryu-monitor.component';
const routes: Routes = [{
  path: 'overview',
  component: OverviewComponent
}, {
  path: 'network',
  component: NetworkComponent
}, {
  path: 'network/topo/:uuid',
  component: NetworkTopoComponent
}, {
  path: 'cpe',
  component: CeComponent
}, {
  path: 'ha',
  component: HaComponent
}, {
  path: 'vpe',
  component: VpeComponent
}, {
  path: 'linkMonitor',
  component: LinkMonitorComponent
}, {
  path: 'publicNetworkMonitor',
  component: PublicNetworkMonitorComponent
}, {
  path: 'vpeInterface',
  component: VpePeInterfaceComponent
}, {
  path: 'stock',
  component: StockComponent
}, {
  path: 'agentVersion',
  component: CeAgentVersionComponent
}, {
  path: 'ceModel',
  component: CeModelComponent
}, {
  path: 'ryuMonitor',
  component: RyuMonitorComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SdwanRoutingModule {
}
