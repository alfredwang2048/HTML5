import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Model} from '../../../m-common/relate-input/relate-input.component';
import {QueryCondition} from '../../../base';

@Component({
  selector: 'app-stock-search',
  templateUrl: './stock-search.component.html',
  styleUrls: ['./stock-search.component.styl']
})
export class StockSearchComponent implements OnInit {

  @Input()
  searchInitObj = {name: '', value: ''};

  relateOptions: Array<Model> = [{
    name: 'esn',
    value: 'ESN号',
    op: '=',
    hasRelate: false
  }, {
    name: 'model',
    value: 'CPE型号',
    op: 'like',
    hasRelate: false
  }];
  selectedRelate: { model: Model, value: string };
  @Output()
  done: EventEmitter<Array<QueryCondition>> = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  relateChange(m: {model: Model, value: string}) {
    this.selectedRelate = m;
  }

  searchHandler() {
    let conds = [];
    if (this.selectedRelate && this.selectedRelate.value) {
      const val = this.selectedRelate.model.op === 'like' ? `%${this.selectedRelate.value}%` : this.selectedRelate.value;
        conds.push({
          name: this.selectedRelate.model.alisName || this.selectedRelate.model.name,
          op: this.selectedRelate.model.op,
          value: val
        });
    }
    if (this.selectedRelate && this.selectedRelate.model.otherConditions) {
      conds = conds.concat(this.selectedRelate.model.otherConditions);
    }
    this.done.emit(conds);
  }


}
