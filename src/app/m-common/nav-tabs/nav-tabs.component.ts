import {Component, OnInit, Input, Output, EventEmitter, forwardRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-nav-tabs',
  templateUrl: './nav-tabs.component.html',
  styleUrls: ['./nav-tabs.component.styl'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NavTabsComponent),
    multi: true
  }]
})
export class NavTabsComponent implements OnInit, ControlValueAccessor {

  @Input()
    lists: Array<CommonGroupData>;
  @Input()
    model: CommonGroupData;
  @Input()
    width: string;
  @Input()
    style: any;
  @Output()
    modelChange: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
  }

  selectTab(data) {
    this.model = data;
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

export interface CommonGroupData {
  text: string;
  value: string;
}
