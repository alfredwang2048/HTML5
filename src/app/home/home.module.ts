import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MCommonModule } from '../m-common/m-common.module';
import { HomeRoutingModule } from './home-routing.module';
import { OverviewComponent } from './overview/overview.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MCommonModule,
    HomeRoutingModule
  ],

  declarations: [
    OverviewComponent
  ]
})
export class HomeModule { }
