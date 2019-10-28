import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {CeService} from '../../../shared/sdwan/ce.service';
import {LeaseInventory} from '../../../shared/sdwan/api';
import {PageSize} from '../../../model';

@Component({
  selector: 'app-ce-dhcp-lease',
  templateUrl: './ce-dhcp-lease.component.html',
  styleUrls: ['./ce-dhcp-lease.component.styl']
})
export class CeDhcpLeaseComponent implements OnInit {
  @Input()
    selectedCe: CeInventory;
  @Output()
    done: EventEmitter<any> = new EventEmitter();
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  dhcpInfo: Array<LeaseInventory>;
  gridLoading = false;

  dialogOptions = {
    title: '查看DHCP客户端',
    width: '500px',
    visible: false,
    changeHeight: 0
  };

  constructor(
    private ceService: CeService
  ) { }

  ngOnInit() {
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.pagination.current = 1;
    this.search();
  }


  search() {
    this.gridLoading = true;
    this.dhcpInfo = [];
    setTimeout(() => {
      this.ceService.getDhcpInfo(this.selectedCe.uuid, datas => {
        this.gridLoading = false;
        if (datas) {
          this.dhcpInfo = datas.slice(this.pagination.size * (this.pagination.current - 1), this.pagination.size * this.pagination.current);
          this.pagination.total = datas.length;
          this.pagination.show = datas.length !== 0;
          this.dialogOptions.changeHeight ++ ;
        }
      });
    });
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  pageChange(size: number, isSize: boolean) {
    if (isSize) {
      this.pagination.current = 1;
      this.pagination.size = size;
    } else {
      this.pagination.current = size;
    }
    this.search();
  }

}
