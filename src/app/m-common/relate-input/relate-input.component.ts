import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-relate-input',
  templateUrl: './relate-input.component.html',
  styleUrls: ['./relate-input.component.styl']
})
export class RelateInputComponent implements OnInit, OnChanges {
  @Input()
  model: Array<Model> = [{name: '', value: '请选择', hasRelate: false}];
  @Output()
  relateChange: EventEmitter<Relate> = new EventEmitter<Relate>();
  @Input()
  relateName: string;
  @Input()
  relateValue: string;
  hasRelate: boolean;
  relateList: Array<ListItem>;
  @Output()
  keyUpDone: EventEmitter<any> = new EventEmitter();
  private selectModel: Model;

  constructor() {
  }

  ngOnInit() {
    if (this.model.length > 0) {
      if (this.relateName) {
        this.model.forEach((m) => {
          if (m.name === this.relateName) {
            this.selectModel = m;
            this.hasRelate = m.hasRelate;
            if (m.hasRelate) {
              this.relateList = m.list;
            }
            return false;
          }
        });
      } else {
        this.selectModel = this.model[0];
        this._update(this.model[0], true);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.relateName) {
      this.model.forEach((m) => {
        if (changes.relateName.currentValue && m.name === changes.relateName.currentValue) {
          this.selectModel = m;
          this.hasRelate = m.hasRelate;
          if (m.hasRelate) {
            this.relateList = m.list;
          }
          return false;
        }
      });
    }
  }

  nameChangeHandler(name: string) {
    for (let i = 0; i < this.model.length; i++) {
      if (this.model[i].name === name) {
        this.selectModel = this.model[i];
        this._update(this.model[i], false);
        break;
      }
    }
  }

  valueChangeHandler(value: string) {
    this.relateValue = value;
    this.relateChange.emit({model: this.selectModel, value: this.relateValue});
  }

  onKeyUp(e, v) {
    if (v === '' || v.length === 0) {
      return;
    }
    this.relateChange.emit({model: this.selectModel, value: v});
    this.keyUpDone.emit();
  }

  private _update(model: Model, isInit: boolean) {
    this.relateName = model.name;
    this.hasRelate = model.hasRelate;
    if (this.hasRelate) {
      this.relateList = model.list;
      if (model.list && model.list.length > 0) {
        this.relateValue = this.relateList[0].name;
      }
    } else {
      this.relateList = [];
      this.relateValue = '';
    }
    if (!isInit) {
      this.relateChange.emit({model: this.selectModel, value: this.relateValue});
    }
  }
}

export class Relate {
  model: Model;
  value: string;
}

export interface Model {
  name: string;
  value: string;
  hasRelate: boolean;
  list?: Array<ListItem>;

  [prop: string]: any;
}

interface ListItem {
  name: string;
  value: string;
}
