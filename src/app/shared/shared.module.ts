import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RestApiService} from './rest-api.service';
import {WCookiesService} from './w-cookies.service';
import {AccountService} from './account/account.service';
import {WindowService} from './window.service';
import {DocumentService} from './document.service';
import {MsgService} from './message/msg.service';
import {DynamicGenerateService} from './dynamic-generate.service';
import {MessageComponent} from './message/message.component';
import {PayService} from './pay.service';
import {TunnelService} from './tunnel';
import {VpeService} from './sdwan';
import {CeService} from './sdwan/ce.service';
import {SdwanService} from './sdwan/sdwan.service';
import {NodeService} from './node';
import {LinkMonitorService} from './sdwan/link-monitor.service';
import { MonitorService } from './monitor.service';
import { DateFormatService } from './date-format.service';
import {PublicNetworkMonitorService} from './sdwan/publicNetworkMonitor.service';
import {HaService} from './sdwan/ha.service';
import {StockService} from './sdwan/stock.service';
import {AgentVersionService} from './sdwan/agent-version.service';
import {CeModelService} from './sdwan/ce-model.service';
import { RyuService } from './sdwan/ryu.service';
import {MfaService} from './mfa/mfa.service';
import {MfaComponent} from './mfa/mfa.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MCommonModule} from '../m-common/m-common.module';
export function getDocument(): any {
  return document;
}

export function getWindow(): any {
  return window;
}

@NgModule({
  imports: [
    CommonModule,
    MCommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    MessageComponent,
    MfaComponent
  ],
  exports: [
    MessageComponent,
    MfaComponent
  ],
  entryComponents: [
    MessageComponent
  ]
})
export class SharedModule {
  constructor() {
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        {
          provide: WindowService,
          useFactory: getWindow
        },
        {
          provide: DocumentService,
          useFactory: getDocument
        },
        MsgService,
        RestApiService,
        WCookiesService,
        AccountService,
        DynamicGenerateService,
        TunnelService,
        PayService,
        VpeService,
        CeService,
        SdwanService,
        NodeService,
        LinkMonitorService,
        MonitorService,
        PublicNetworkMonitorService,
        DateFormatService,
        HaService,
        StockService,
        AgentVersionService,
        CeModelService,
        RyuService,
        MfaService
      ]
    };
  }
}
