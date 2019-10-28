import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
@Injectable()
export class PayService {
  tableData: PayTableData = {
    type: null,
    resource: null,
    name: null,
    description: null,
    duration: null,
    totalPay: null,
    status: '待支付'
  };
  lastPath: string;
  productType: string;
  requestData: any;
  callFunc: Function;
  constructor(private router: Router) { }
  goBack() {
    this.tableData.type = null;
    this.tableData.resource = null;
    this.tableData.name = null;
    this.tableData.description = null;
    this.tableData.duration = null;
    this.tableData.totalPay = null;
    this.productType = null;
    this.router.navigate([this.lastPath]);
  }
}
interface PayTableData {
  type: string;
  resource: string;
  name: string;
  description: Array<any>;
  duration: string;
  totalPay: string;
  status: string;
}
