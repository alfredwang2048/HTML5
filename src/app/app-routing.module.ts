import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RefundRuleComponent } from './refund-rule/refund-rule.component';
const routes: Routes = [
  {
    path: 'sdwan',
    loadChildren: 'app/sdwan/sdwan.module#SdwanModule'
  }, {
    path: 'pay',
    loadChildren: 'app/pay/pay.module#PayModule'
  }, {
    path: 'refundRule',
    component: RefundRuleComponent
  }, {
    path: '',
    redirectTo: 'sdwan/overview',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
