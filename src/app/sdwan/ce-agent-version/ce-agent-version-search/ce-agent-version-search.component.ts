import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Model} from '../../../m-common/relate-input/relate-input.component';
import {QueryCondition} from '../../../base';

@Component({
  selector: 'app-ce-agent-version-search',
  templateUrl: './ce-agent-version-search.component.html',
  styleUrls: ['./ce-agent-version-search.component.styl']
})
export class CeAgentVersionSearchComponent implements OnInit {

  constructor() { }
  relateOptions: Array<Model> = [
    {
      name: 'uuid',
      op: '=',
      value: 'UUID',
      hasRelate: false
    },
    {
      name: 'version',
      op: '=',
      value: '版本',
      hasRelate: false
    }
  ];
  selectedRelate: { model: Model, value: string };
  @Output()
  done: EventEmitter<Array<QueryCondition>> = new EventEmitter();

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
