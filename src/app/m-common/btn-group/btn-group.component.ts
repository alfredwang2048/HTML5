import {Component, OnInit, Input, Output, EventEmitter, forwardRef} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
@Component({
  selector: 'app-btn-group',
  templateUrl: './btn-group.component.html',
  styleUrls: ['./btn-group.component.styl'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => BtnGroupComponent),
    multi: true
  }],
})
export class BtnGroupComponent implements OnInit, ControlValueAccessor {
  @Input()
  models: Array<Model>;
  @Output()
  modelChange: EventEmitter<string | number> = new EventEmitter();
  @Input()
  model: string | number;
  constructor() {
  }

  ngOnInit() {
  }

  selectItem(item) {
    this.model = item.value;
    this.modelChange.emit(this.model);
    this.controlChange(this.model);
  }
  writeValue(value) {
    if (value) {
      this.model = value;
    }else {
      this.model = null;
    }
  }
  registerOnChange(fn) {
    this.controlChange = fn;
  }
  registerOnTouched(fn) {
    this.touchedChange = fn;
  }
  private controlChange: Function = () => {};
  private touchedChange: Function = () => {};
}
class Model {
  name: string;
  value: string | number;
}
