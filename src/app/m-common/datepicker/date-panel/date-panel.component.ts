import { Component, OnInit, OnChanges, Input, Output, SimpleChanges, EventEmitter, Optional } from '@angular/core';
import { dropAnimation } from '../../animation';
@Component({
  selector: 'app-date-panel',
  templateUrl: './date-panel.component.html',
  styleUrls: ['./date-panel.component.styl'],
  animations: [dropAnimation]
})
export class DatePanelComponent implements OnInit, OnChanges {
  @Input()
  show = false;
  @Input()
  width: number;
  @Input()
  model: number;
  @Output()
  modelChange: EventEmitter<number> = new EventEmitter();
  currentView = 'date';
  dateShowModels: any;
  constructor() { }
  showPicker(pickPath: string) {
    this.currentView = pickPath;
  }
  updateDate() {
    const date = new Date(this.model);
    const startYear = Math.floor(date.getFullYear() / 10) * 10;
    this.dateShowModels = {
      month: date.getMonth(),
      year: date.getFullYear(),
      yearRange: [startYear, startYear + 10]
    };
  }
  datePickChangeHandle(time: number) {
    this.model = time;
    this.modelChange.emit(time);
    this.updateDate();
  }
  monthPickChangeHandle(time) {
    this.model = time;
    this.currentView = 'date';
    this.updateDate();
  }
  yearPickChangeHandle(time) {
    this.model = time;
    this.currentView = 'month';
    this.updateDate();
  }
  nextYear(step: number) {
    if ( this.currentView === 'year') {
      step = step * 10;
    }
    const date = new Date(this.model);
    date.setFullYear(this.dateShowModels.year + step);
    this.model = date.getTime();
    this.updateDate();
  }
  nextMonth(step: number) {
    const date = new Date(this.model);
    date.setMonth(this.dateShowModels.month + step);
    this.model = date.getTime();
    this.updateDate();
  }
  ngOnInit() {
    this.model = this.model || Date.now();
    this.updateDate();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.model && !changes.model.isFirstChange()) {
      this.model = this.model || Date.now();
      this.updateDate();
    }
  }
}
