import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Model} from '../../../m-common/relate-input/relate-input.component';
import {QueryCondition} from '../../../base';

@Component({
  selector: 'app-link-monitor-search',
  templateUrl: './link-monitor-search.component.html',
  styleUrls: ['./link-monitor-search.component.styl']
})
export class LinkMonitorSearchComponent implements OnInit {
  @Input()
  searchInitObj = {name: '', value: ''};

  constructor() { }
  relateOptions: Array<Model> = [
    {
      name: 'uuid',
      op: '=',
      value: 'UUID',
      hasRelate: false
    },
    {
      name: 'sdwanNetworkUuid',
      op: '=',
      value: '所属网络UUID',
      hasRelate: false
    },
    {
      name: 'vpe.name',
      op: 'like',
      value: 'VPE名称',
      hasRelate: false
    },
    {
      name: 'vpe.manageIp',
      op: 'like',
      value: 'VPE IP',
      hasRelate: false
    },
    {
      name: 'peType',
      value: 'PE类型',
      op: '=',
      hasRelate: true,
      list: [{
        name: '',
        value: '全部'
      }, {
        name: 'Bypass',
        value: 'Bypass'
      }, {
        name: 'Direct',
        value: 'Direct'
      }]
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
        value: '正常'
      }, {
        name: 'Disconnected',
        value: '异常'
      }, {
        name: 'Connecting',
        value: '连接中'
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
