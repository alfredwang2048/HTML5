import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Model} from '../../../m-common/relate-input/relate-input.component';
import {QueryCondition} from '../../../base';
import {AccountInventory} from '../../../shared/account';

@Component({
  selector: 'app-network-search',
  templateUrl: './network-search.component.html',
  styleUrls: ['./network-search.component.styl']
})
export class NetworkSearchComponent implements OnInit {

  selectedAccount: AccountInventory;
  relateOptions: Array<Model> = [
    {
      name: 'name',
      op: 'like',
      value: '名称',
      hasRelate: false
    }, {
      name: 'uuid',
      op: '=',
      value: 'UUID',
      hasRelate: false
    }, {
      name: 'l3networkUuid',
      op: '=',
      value: '云网络UUID',
      hasRelate: false
    }];
  selectedRelate: { model: Model, value: string };
  @Output()
  done: EventEmitter<Array<QueryCondition>> = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
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
