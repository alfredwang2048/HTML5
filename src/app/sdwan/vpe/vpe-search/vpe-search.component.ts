import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Model} from '../../../m-common/relate-input/relate-input.component';
import {QueryCondition} from '../../../base';

@Component({
  selector: 'app-vpe-search',
  templateUrl: './vpe-search.component.html',
  styleUrls: ['./vpe-search.component.styl']
})
export class VpeSearchComponent implements OnInit {

  relateOptions: Array<Model> = [
    {
      name: 'uuid',
      op: '=',
      value: 'UUID',
      hasRelate: false
    },
    {
      name: 'name',
      op: 'like',
      value: 'VPE名称',
      hasRelate: false
    },
    {
      name: 'manageIp',
      op: '=',
      value: '管理IP',
      hasRelate: false
    },
    {
      name: 'state',
      value: '状况',
      op: '=',
      hasRelate: true,
      list: [{
        name: '',
        value: '全部'
      }, {
        name: 'Enabled',
        value: '启用'
      }, {
        name: 'Disabled',
        value: '禁用'
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
