import { Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  Renderer2,
  forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import {DateFormatService} from '../../shared/date-format.service';
import { ProxyDocumentService } from '../proxy-document.service';
@Component({
  selector: 'app-daterangepicker',
  templateUrl: './daterangepicker.component.html',
  styleUrls: ['./daterangepicker.component.styl'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DaterangepickerComponent),
      multi: true
    }
  ]
})
export class DaterangepickerComponent implements OnInit, ControlValueAccessor, OnDestroy {
  @Input()
  dateFormat = 'yyyy-MM-dd hh:mm:ss';
  @Input()
   model: DateRangeModel;
  @Output()
  modelChange: EventEmitter<DateRangeModel> = new EventEmitter();
  @Input()
  maxRange = 30 * 24 * 60 * 60 * 1000;
  rangeModel = {
    start: null,
    end: null
  };
  showPanel = false;
  startText = '';
  endText = '';
  globalFunction: Function;
  uuid = Math.random().toString(16).slice(2, 8);
  shortCuts = [{
    name: 'hour',
    text: '最近一小时',
    tick: 60 * 60 * 1000
  }, {
    name: '6hour',
    text: '最近六小时',
    tick: 6 * 60 * 60 * 1000
  }, {
    name: 'day',
    text: '最近一天',
    tick: 24 * 60 * 60 * 1000
  }, {
    name: 'week',
    text: '最近一周',
    tick: 7 * 24 * 60 * 60 * 1000
  }, {
    name: 'month',
    text: '最近一月',
    tick: 30 * 24 * 60 * 60 * 1000
  }, {
    name: 'custom',
    text: '自定义',
    tick: 0
  }];
  constructor(private renderer: Renderer2, private proxyDoc: ProxyDocumentService) { }
  ngOnInit() {
    this.proxyDoc.addComponent('daterange', this);
    if (this.model.start) {
      this.rangeModel.start = this.model.start;
      this.startText = DateFormatService.moment(this.model.start, this.dateFormat);
    }else {
      this.rangeModel.start = null;
      this.startText = '';
    }
    if (this.model.end) {
      this.rangeModel.end = this.model.end;
      this.endText = DateFormatService.moment(this.model.end, this.dateFormat);
    }else {
      this.rangeModel.end = null;
      this.endText = '';
    }
    this.globalFunction = this.renderer.listen('document', 'click', () => {
      this.showPanel = false;
    });
  }
  shortClickHandle(type) {
    this.model.type = type;
    if (type !== 'custom') {
      const now = new Date();
      const cut = this.shortCuts.find(item => item.name === type);
      this.model.end = now.getTime();
      this.model.start = now.getTime() - cut.tick;
      this.rangeModel.start = null;
      this.rangeModel.end = null;
      this.startText = '';
      this.endText = '';
    }else {
      this.model.end = new Date().getTime();
      this.model.start = new Date().getTime() - 60 * 60 * 1000;
      this.rangeModel.start = this.model.start;
      this.rangeModel.end = this.model.end;
      this.startText = DateFormatService.moment(this.model.start, this.dateFormat);
      this.endText = DateFormatService.moment(this.model.end, this.dateFormat);
    }
    this.modelChange.emit(this.model);
  }
  ngOnDestroy() {
    this.proxyDoc.deleteComponent('daterange', this.uuid);
  }
  wrapperClickHandle() {
    this.showPanel = !this.showPanel;
  }
  clearClick(e) {
    e.stopPropagation();
    this.rangeModel.start = null;
    this.rangeModel.end = null;
    this.startText = '';
    this.endText = '';
    this.model.start = null;
    this.model.end = null;
    this.modelChange.emit(this.model);
    this.controlChange(this.model);
    this.showPanel = false;
  }
  startChange(e) {
    this.rangeModel.start = this.model.start = e;
    this.startText = e ? DateFormatService.moment(this.model.start, this.dateFormat) : '';
    this.modelChange.emit(this.model);
    this.controlChange(this.model);
  }
  endChange(e) {
    this.rangeModel.end = this.model.end = e;
    this.endText = e ? DateFormatService.moment(this.model.end, this.dateFormat) : '';
    this.modelChange.emit(this.model);
    this.controlChange(this.model);
  }
  writeValue(dateRange) {
    this.model = dateRange;
    this.modelChange.emit(this.model);
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
export interface DateRangeModel {
  type: string;
  start: number;
  end: number;
}
