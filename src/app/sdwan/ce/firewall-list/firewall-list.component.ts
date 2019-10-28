import {AfterContentChecked, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeInventory, FirewallInventory} from '../../../shared/sdwan';
import {PageSize} from '../../../model';
import {QueryObject} from '../../../base';
import {CeService} from '../../../shared/sdwan/ce.service';

import { Subscription } from 'rxjs/';
import { DragulaService } from 'ng2-dragula';

@Component({
  selector: 'app-firewall-list',
  templateUrl: './firewall-list.component.html',
  styleUrls: ['./firewall-list.component.styl']
})
export class FirewallListComponent implements OnInit, AfterContentChecked {
  @Input()
    selectedItem: any;
  @Input()
    resourceQuotaNumber: number;
  @Input()
    isModel = false;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();
  dialogOptions = {
    title: '防火墙配置',
    width: '800px',
    visible: false,
    changeHeight: 0
  };
  fireWalls: Array<any> = [];
  copyFireWalls;
  gridLoading = true;
  input_box = false;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  selectedFireWall: Array<any> = [];

  vampires = [{name: '222'}, {name: '111'}];
  subs = new Subscription();
  constructor(
    private ceService: CeService,
    private dragulaService: DragulaService
  ) {
    // These will get events limited to the VAMPIRES group.

    this.subs.add(this.dragulaService.drag('VAMPIRES')
      .subscribe(({ name, el, source }) => {
        // ...
      })
    );
    this.subs.add(this.dragulaService.drop('VAMPIRES')
      .subscribe(({ name, el, target, source, sibling }) => {
        // ...
      })
    );
    // some events have lots of properties, just pick the ones you need
    this.subs.add(this.dragulaService.dropModel('VAMPIRES')
      // WHOA
      // .subscribe(({ name, el, target, source, sibling, sourceModel, targetModel, item }) => {
      .subscribe(({ sourceModel, targetModel, item }) => {
        // ...
      })
    );

    // You can also get all events, not limited to a particular group
    this.subs.add(this.dragulaService.drop()
      .subscribe(({ name, el, target, source, sibling }) => {
        // ...
      })
    );
  }

  ngOnInit() {
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.selectedFireWall = [];
    this.input_box = false;
    setTimeout(() => {
      this.search();
    });
  }

  ngAfterContentChecked() {
    if (this.fireWalls.length) {
      this.dialogOptions.changeHeight ++;
    }
  }

  createFirewallDone(params) {
    this.done.emit({type: 'add', data: params});
  }

  clickId() {
    this.selectedFireWall = this.fireWalls.filter(item => item.status);
  }

  selectAll(value) {
    if (value) {
      this.fireWalls.map(item => {
        item.status = true;
      });
    }else {
      this.fireWalls.map(item => {
        item.status = false;
      });
    }
    this.clickId();
  }

  selectItem(e) {
    e.rowData.status = true;
    this.clickId();
  }

  deleteFireWall() {
    this.done.emit({type: 'delete', data: this.selectedFireWall});
    /*this.selectedFireWall = [];*/
  }

  search() {
    this.fireWalls = [];
    const qobj = new QueryObject();
    qobj.start = 0;
    qobj.limit = 500;
    qobj.sortBy = 'rank';
    qobj.addCondition({name: this.isModel ? 'sdwanNetworkUuid' : 'ceUuid', op: '=', value: this.selectedItem.uuid});
    this.gridLoading = true;
    const sub = this.ceService.queryFireWall(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.fireWalls = datas;
      this.fireWalls.map(item => item.status = false);
      this.copyFireWalls = JSON.parse(JSON.stringify(datas));
      this.pagination.total = total;
      this.pagination.show = total !== 0;
      this.dialogOptions.changeHeight ++;
    }, this.isModel);
  }

  refresh(params) {
    this.input_box = false;
    this.selectedFireWall = [];
    if (params.type === 'add') {
      this.fireWalls.push(params.data);
    }else if (params.type === 'delete') {
      params.data.forEach(item => {
        let flag = true;
        this.fireWalls.forEach((it, index) => {
          if (flag && it.uuid === item.uuid) {
            this.fireWalls.splice(index, 1);
            flag = false;
          }
        });
      });
    }
    this.pagination.total = this.fireWalls.length;
    this.pagination.show = this.fireWalls.length !== 0;
    this.dialogOptions.changeHeight ++;
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

  cancel() {
    this.dialogOptions.visible = false;
  }

  save() {
    let infoPage = null;
    if (this.isModel) {
      infoPage = {sdwanNetworkUuid: this.selectedItem.uuid, firewalls: ''};
    }else {
      infoPage = {ceUuid: this.selectedItem.uuid, firewalls: ''};
    }
    infoPage.firewalls = this.fireWalls.map((item, index) => {
      const fireWall = new FirewallInventory();
      if (item.srcIP) {
        fireWall.srcIP = item.srcIP;
      }
      if (item.destIP) {
        fireWall.destIP = item.destIP;
      }
      if (item.srcPort) {
        fireWall.srcPort = item.srcPort;
      }
      if (item.destPort) {
        fireWall.destPort = item.destPort;
      }
      fireWall.protocol = item.protocol;
      fireWall.direction = item.direction;
      fireWall.action = item.action;
      fireWall.rank = index + 1;
      return fireWall;
    });
    this.dialogOptions.visible = false;
    this.done.emit({type: 'save', data: infoPage});
  }

  validatorModel() {
    if (this.fireWalls.length === this.copyFireWalls.length) {
      if (this.fireWalls.length) {
        let flag = true;
        this.fireWalls.forEach(item => {
          if (this.copyFireWalls.map( it => it.uuid).indexOf(item.uuid) === -1 && flag) {
            flag = false;
            setTimeout(() => {
              this.dialogOptions.visible = true;
              this.done.emit({type: 'attention'});
            });
          }
        });
      }
    }else {
      setTimeout(() => {
        this.dialogOptions.visible = true;
        this.done.emit({type: 'attention'});
      });
    }
  }
}
