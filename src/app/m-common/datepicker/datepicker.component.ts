import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  Renderer2,
  OnDestroy
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {DateFormatService } from '../../shared/date-format.service';
import { ProxyDocumentService } from '../proxy-document.service';
@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.styl'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatepickerComponent),
    multi: true
  }, DateFormatService]
})
export class DatepickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input()
  readonly = false;
  @Input()
  clearable = true;
  @Input()
  placeholder = '选择日期';
  @Input()
  format = 'yyyy-MM-dd';
  @Input()
  panelWidth = 300;
  @Input()
  model = '';
  @Output()
  modelChange: EventEmitter<string> = new EventEmitter();
  showPanelPicker = false;
  value: number;
  globalClickListener: Function;
  uuid = Math.random().toString(16).slice(2, 8);
  constructor(private dateFormat: DateFormatService, private renderer: Renderer2, private proxyDoc: ProxyDocumentService) { }
  propagationHandle(e) {
    e.stopPropagation();
  }
  clearHandle(e) {
    e.stopPropagation();
    this.model = null;
    this.value = Date.now();
    this.showPanelPicker = false;
    this.modelChange.emit(null);
    this.controlChange(null);
  }
  iconClickHandle() {
    this.showPanelPicker = !this.showPanelPicker;
  }
  inputChangeHandle(input: string) {
    const time = this.dateFormat.getTime(input);
    this.value = time;
  }
  focusHandle() {
    this.showPanelPicker = true;
  }
  dateChangeHandle(time: number) {
    this.model = DateFormatService.moment(time, this.format);
    this.value = new Date(this.model).getTime();
    this.modelChange.emit(this.model);
    this.controlChange(this.model);
    this.showPanelPicker = false;
  }
  writeValue(value: any) {
    this.model = value;
  }
  ngOnInit() {
    this.proxyDoc.addComponent('datepicker', this);
    this.globalClickListener = this.renderer.listen('document', 'click', () => {
      this.showPanelPicker = false;
    });
    const time: number = this.dateFormat.getTime(this.model);
    if (!time) {
      return false;
    }
    this.model = DateFormatService.moment(time, this.format);
    this.value = time;
  }
  ngOnDestroy() {
    this.proxyDoc.deleteComponent('datepicker', this.uuid);
    if (this.globalClickListener) {
      this.globalClickListener();
    }
  }
  registerOnChange(fn: Function): void {
    this.controlChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.controlTouch = fn;
  }

  private controlChange: Function = () => {};
  private controlTouch: Function = () => {};
}
