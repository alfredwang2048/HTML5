import {ModuleWithProviders, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { WDropdownComponent } from './w-dropdown/w-dropdown.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SubSidebarComponent } from './sub-sidebar/sub-sidebar.component';
import { CollapseComponent } from './collapse/collapse.component';
import { SearchAccountComponent } from './search-account/search-account.component';
import { WDialogComponent } from './w-dialog/w-dialog.component';
import { RelateInputComponent } from './relate-input/relate-input.component';
import { PaginationComponent } from './pagination/pagination.component';
import { PageBtnComponent } from './pagination/page-btn/page-btn.component';
import { PageSizeComponent } from './pagination/page-size/page-size.component';
import { PagerComponent } from './pagination/pager/pager.component';
import { JumpComponent } from './pagination/jump/jump.component';
import { CascaderComponent } from './cascader/cascader.component';
import { RightModalComponent } from './right-modal/right-modal.component';
import { CommonWindowComponent } from './common-window/common-window.component';
import { EscapeHtmlPipe } from './escape-html.pipe';
import { ToggleManageService } from './toggle-manage.service';
import { GridComponent } from './grid/grid.component';
import { GridColumnComponent } from './grid/grid-column/grid-column.component';
import { BandwidthComponent } from './bandwidth/bandwidth.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SetManagerComponent } from './set-manager/set-manager.component';
import { TransOfferingPipe } from './trans-offering.pipe';
import { DaterangepickerComponent } from './daterangepicker/daterangepicker.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { DateTableComponent } from './datepicker/children/date-table/date-table.component';
import { MonthTableComponent } from './datepicker/children/month-table/month-table.component';
import { YearTableComponent } from './datepicker/children/year-table/year-table.component';
import { DatePanelComponent } from './datepicker/date-panel/date-panel.component';
import { DaterangePanelComponent } from './daterangepicker/daterange-panel/daterange-panel.component';
import {LoadingWindowComponent} from './loading-window/loading-window.component';

import { ProxyDocumentService } from './proxy-document.service';
import { HelpDocComponent } from './help-doc/help-doc.component';
import {BtnGroupComponent} from './btn-group/btn-group.component';
import { NavTabsComponent } from './nav-tabs/nav-tabs.component';
import { IpCidrComponent } from './ip-cidr/ip-cidr.component';
import { ToolTipDirective } from './tool-tip.directive';
import { TopoComponent } from './topo/topo.component';
import { TopoTooltipComponent } from './topo/topo-tooltip/topo-tooltip.component';
import { TopoNodeComponent } from './topo/topo-node/topo-node.component';
import { TopoLineComponent } from './topo/topo-line/topo-line.component';
import { TopoContainerComponent } from './topo/topo-container/topo-container.component';
import {ElSwitchComponent} from './switch/switch.component';
import {BottomCommentComponent} from './bottom-comment/bottom-comment.component';
import {CountDownComponent} from './count-down/count-down.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    HeaderComponent,
    WDropdownComponent,
    SidebarComponent,
    SubSidebarComponent,
    CollapseComponent,
    SearchAccountComponent,
    WDialogComponent,
    RelateInputComponent,
    PaginationComponent,
    PageBtnComponent,
    PageSizeComponent,
    PagerComponent,
    JumpComponent,
    CascaderComponent,
    RightModalComponent,
    CommonWindowComponent,
    EscapeHtmlPipe,
    GridComponent,
    GridColumnComponent,
    BandwidthComponent,
    SetManagerComponent,
    TransOfferingPipe,
    DaterangepickerComponent,
    DatepickerComponent,
    DateTableComponent,
    MonthTableComponent,
    YearTableComponent,
    DatePanelComponent,
    DaterangePanelComponent,
    LoadingWindowComponent,
    HelpDocComponent,
    BtnGroupComponent,
    NavTabsComponent,
    IpCidrComponent,
    ToolTipDirective,
    TopoComponent,
    TopoNodeComponent,
    TopoLineComponent,
    TopoContainerComponent,
    TopoTooltipComponent,
    ElSwitchComponent,
    BottomCommentComponent,
    CountDownComponent
  ],
  exports: [
    HeaderComponent,
    WDropdownComponent,
    SidebarComponent,
    SubSidebarComponent,
    SearchAccountComponent,
    WDialogComponent,
    RelateInputComponent,
    PaginationComponent,
    CascaderComponent,
    RightModalComponent,
    CommonWindowComponent,
    EscapeHtmlPipe,
    GridComponent,
    GridColumnComponent,
    BandwidthComponent,
    SetManagerComponent,
    CollapseComponent,
    TransOfferingPipe,
    DatepickerComponent,
    DaterangepickerComponent,
    LoadingWindowComponent,
    HelpDocComponent,
    BtnGroupComponent,
    NavTabsComponent,
    IpCidrComponent,
    ToolTipDirective,
    TopoComponent,
    ElSwitchComponent,
    BottomCommentComponent,
    CountDownComponent
  ]
})
export class MCommonModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MCommonModule,
      providers: [ToggleManageService, ProxyDocumentService]
    };
  }
}
