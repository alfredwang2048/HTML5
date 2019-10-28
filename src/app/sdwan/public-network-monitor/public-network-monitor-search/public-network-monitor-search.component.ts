import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Model} from '../../../m-common/relate-input/relate-input.component';
import {QueryCondition} from '../../../base';

@Component({
  selector: 'app-public-network-monitor-search',
  templateUrl: './public-network-monitor-search.component.html',
  styleUrls: ['./public-network-monitor-search.component.styl']
})
export class PublicNetworkMonitorSearchComponent implements OnInit {
  @Input()
  searchInitObj = {name: '', value: ''};
  constructor() {}
  relateOptions: Array<Model> = [
    {
      name: 'vpe.name',
      op: 'like',
      value: 'VPE名称',
      hasRelate: false
    }, {
      name: 'publicIp',
      op: 'like',
      value: 'IP',
      hasRelate: false
    }, {
      name: 'status',
      value: '状态',
      op: '=',
      hasRelate: true,
      list: [{
        name: '',
        value: '全部'
      }, {
        name: 'Connected',
        value: 'Connected'
      }, {
        name: 'Disconnected',
        value: 'Disconnected'
      }, {
        name: 'Connecting',
        value: 'Connecting'
      }]
    }
  ];
  selectedRelate: { model: Model, value: string };
  @Output()
  done: EventEmitter<Array<QueryCondition>> = new EventEmitter();

  ngOnInit() {
    if (this.searchInitObj && this.searchInitObj.name) {
      this.selectedRelate = {
        model: this.relateOptions.find(item => item.name === this.searchInitObj.name),
        value: this.searchInitObj.value
      };
    }
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
