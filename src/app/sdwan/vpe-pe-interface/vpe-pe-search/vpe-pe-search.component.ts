import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Model} from '../../../m-common/relate-input/relate-input.component';
import {QueryCondition} from '../../../base';

@Component({
  selector: 'app-vpe-pe-search',
  templateUrl: './vpe-pe-search.component.html',
  styleUrls: ['./vpe-pe-search.component.styl']
})
export class VpePeSearchComponent implements OnInit {

  relateOptions: Array<Model> = [
    {
      name: 'uuid',
      op: '=',
      value: 'UUID',
      hasRelate: false
    }, {
      name: 'vpeUuid',
      op: '=',
      value: 'VPE-UUID',
      hasRelate: false
    }, {
      name: 'sdwanNetworkUuid',
      op: '=',
      value: 'SDWAN-UUID',
      hasRelate: false
    }, {
      name: 'endpointUuid',
      op: '=',
      value: '连接点UUID',
      hasRelate: false
    }
  ];
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
    if (this.selectedRelate && this.selectedRelate.value) {
      const val = this.selectedRelate.model.op === 'like' ? `%${this.selectedRelate.value}%` : this.selectedRelate.value;
      conds.push({
        name: this.selectedRelate.model.name,
        op: this.selectedRelate.model.op,
        value: val
      });
    }
    this.done.emit(conds);
  }

}
