import {Component, OnInit} from '@angular/core';
import { QueryObject } from '../../base/api';
import { RyuMonitorInventory, RyuService } from '../../shared/sdwan';
import {PageSize} from '../../model';

@Component({
  selector: 'app-ryu-monitor',
  templateUrl: './ryu-monitor.component.html',
  styleUrls: ['./ryu-monitor.component.styl']
})
export class RyuMonitorComponent implements OnInit {
  ryus: Array<RyuMonitorInventory> = [];
  gridLoading = true;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  constructor(private ryuSerivce: RyuService) {
  }

  ngOnInit() {
    this.search();
  }
  search() {
    const qobj = new QueryObject();
    qobj.start = (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    this.ryus = [];
    this.gridLoading = true;
    this.ryuSerivce.query(qobj, (ryus, total) => {
      this.gridLoading = false;
      this.ryus = ryus;
      if (total) {
        this.pagination.total = total;
        this.pagination.show = true;
      } else {
        this.pagination.show = false;
      }
    });
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
