import { Component, OnInit } from '@angular/core';
import { PayService } from '../../shared/pay.service';
import { AccountService } from '../../shared/account/account.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-pay',
  templateUrl: './pay.component.html',
  styleUrls: ['./pay.component.styl']
})
export class PayComponent implements OnInit {
  tableData: any;
  productType: string;
  cashBalance: string;
  presentBalance: string;
  creditPoint: string;
  totalBalance: number;
  recharge = false;
  loadingInfo = '加载中...';
  infoType = 'success';
  dialogOptions = {
    title: '消息',
    width: '250px',
    visible: false
  };
  constructor(public payService: PayService,
              private actService: AccountService,
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    if (this.payService.productType && this.payService.lastPath) {
      this.tableData = this.payService.tableData;
      this.productType = this.payService.productType;
      this.activatedRoute.paramMap.subscribe((map) => {
        const uuid = map.get('accountUuid');
        this.actService.getAccountBalance(uuid, (balance) => {
          this.cashBalance = balance.cashBalance.toFixed(2);
          this.presentBalance = balance.presentBalance.toFixed(2);
          const credit = balance.cashBalance < 0 ? (balance.cashBalance + balance.creditPoint) : balance.creditPoint;
          this.creditPoint = credit.toFixed(2);
          this.totalBalance = balance.cashBalance + balance.presentBalance + balance.creditPoint;
          this.recharge = this.totalBalance < parseFloat(this.tableData.totalPay);
        });
      });
    }else {
      this.router.navigate(['']);
    }
  }
  confirm() {
    this.dialogOptions.visible = true;
    this.loadingInfo = '加载中...';
    this.payService.callFunc(() => {
      this.loadingInfo = '交易成功';
      this.dialogOptions.visible = false;
      this.infoType = 'success';
      this.payService.goBack();
    }, () => {
      this.infoType = 'error';
      this.loadingInfo = '交易失败';
      const timer = setTimeout(() => {
        clearTimeout(timer);
        this.dialogOptions.visible = false;
      }, 1000);
    });
  }
}
