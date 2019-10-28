import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayComponent } from './pay/pay.component';
import { PayRoutingModule } from './pay-routing.module';
import { MCommonModule } from '../m-common/m-common.module';
@NgModule({
  imports: [
    CommonModule,
    PayRoutingModule,
    MCommonModule
  ],
  declarations: [PayComponent]
})
export class PayModule { }
