import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Model} from '../../../m-common/relate-input/relate-input.component';
import {QueryCondition} from '../../../base';
import {AccountInventory} from '../../../shared/account';
@Component({
  selector: 'app-ha-search',
  templateUrl: './ha-search.component.html',
  styleUrls: ['./ha-search.component.styl']
})
export class HaSearchComponent implements OnInit {

  selectedAccount: AccountInventory;
  relateOptions: Array<Model> = [
    {
      name: 'name',
      op: 'like',
      value: '名称',
      hasRelate: false
    }, {
      name: 'vip',
      op: '=',
      value: 'VIP',
      hasRelate: false
    }, {
      name: '',
      op: '=',
      value: '主连接',
      hasRelate: false
    }, {
      name: '',
      op: '=',
      value: '备连接',
      hasRelate: false
    }, {
      name: 'sdwanNetworkUuid',
      value: 'SD-WAN网络UUID',
      op: '=',
      hasRelate: false
    }];
  selectedRelate: { model: Model, value: string };
  @Output()
  done: EventEmitter<Array<QueryCondition>> = new EventEmitter();
  @Input()
  searchInitObj = {name: '', value: ''};

  constructor() { }

  ngOnInit() {
    this.searchInitObj.name = 'name';
    this.searchInitObj.value = '';
  }

  relateChange(m: { model: Model, value: string }) {
    this.selectedRelate = m;
  }

  searchHandler() {
    const conds = [];
    if (this.selectedAccount) {
      conds.push({name: 'accountUuid', op: '=', value: this.selectedAccount.uuid});
    }
    if (this.selectedRelate && this.selectedRelate.value) {
      const val = this.selectedRelate.model.op === 'like' ? `%${this.selectedRelate.value}%` : this.selectedRelate.value;
      conds.push({
        name: this.selectedRelate.model.name,
        op: this.selectedRelate.model.op, value: val
      });
    }
    this.done.emit(conds);
  }
}
