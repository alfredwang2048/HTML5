import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DateFormatService } from '../../../shared/date-format.service';
import { dropAnimation } from '../../animation';
export interface DateRangeItem {
  day: number;
  monthOffset: number;
  year: number;
  month: number;
  time: number;
}
@Component({
  selector: 'app-daterange-panel',
  templateUrl: './daterange-panel.component.html',
  styleUrls: ['./daterange-panel.component.styl'],
  animations: [dropAnimation]
})
export class DaterangePanelComponent implements OnInit, OnChanges {
  @Input()
  show = false;
  @Output()
  showChange: EventEmitter<boolean> = new EventEmitter();
  @Input()
  start: number;
  @Output()
  startChange: EventEmitter<number> = new EventEmitter();
  @Input()
  end: number;
  @Output()
  endChange: EventEmitter<number> = new EventEmitter();
  @Input()
  maxRange: number;
  weeks: string[] = ['日', '一', '二', '三', '四', '五', '六'];
  tablePrevRows: Array<DateRangeItem[]>;
  tableNextRows: Array<DateRangeItem[]>;
  startDate: Date;
  endDate: Date;
  currentStatus = 'start';
  minSelectedDate: number;
  maxSelectedDate: number;
  originClickDate: number;
  @Input()
  minTime: number;
  @Input()
  maxTime: number = new Date().getTime();
  hours: Array<string> = [];
  minutes: Array<string> = [];
  seconds: Array<string> = [];
  currentStartHour = '00';
  currentStartMinutes = '00';
  currentStartSecond = '00';
  currentEndHour = '00';
  currentEndMinutes = '00';
  currentEndSecond = '00';
  private hourMilliSecond = 60 * 60 * 1000;
  private minutesMilliSecond = 60 * 1000;
  private milliSecond = 1000;
  hasError = false;
  constructor(private dateFormat: DateFormatService) { }

  ngOnInit() {
   this.dateChange();
    for (let i = 0; i <= 23; i++) {
      this.hours.push( i < 10 ? '0' + i : '' + i);
    }
    for (let i = 0; i <= 59; i++) {
      this.minutes.push( i < 10 ? '0' + i : '' + i);
      this.seconds.push( i < 10 ? '0' + i : '' + i);
    }
  }
  nextYear(step: number) {
    this.startDate.setFullYear(this.startDate.getFullYear() + step);
    const startDateYear = this.startDate.getFullYear();
    const startDateMonth = this.startDate.getMonth();
    this.endDate = new Date(startDateMonth + 1 > 11 ? startDateYear + 1 : startDateYear, startDateMonth + 1 > 11 ? 0 : startDateMonth + 1, this.startDate.getDate());
    this.renderCalendar();
  }
  nextMonth(step: number) {
    if (this.startDate.getMonth() + step < 0) {
      this.startDate.setFullYear(this.startDate.getFullYear() - 1);
      this.startDate.setMonth(11);
    }else if (this.startDate.getMonth() + step > 11) {
      this.startDate.setFullYear(this.startDate.getFullYear() + 1);
      this.startDate.setMonth(0);
    }else {
      this.startDate.setMonth(this.startDate.getMonth() + step);
    }
    const startDateYear = this.startDate.getFullYear();
    const startDateMonth = this.startDate.getMonth();
    this.endDate = new Date(startDateMonth + 1 > 11 ? startDateYear + 1 : startDateYear, startDateMonth + 1 > 11 ? 0 : startDateMonth + 1, this.startDate.getDate());
    this.renderCalendar();
  }
  isToday(item: DateRangeItem) {
    const today = new Date();
    return item.year === today.getFullYear() && item.month === today.getMonth() && item.day === today.getDate();
  }
  calStatus(item: DateRangeItem) {
    const time = item.time;
    if (this.maxTime && time > this.maxTime) {
      return 'disable';
    }
    if (this.minTime && time < this.minTime) {
      return 'disable';
    }
    if (item.monthOffset === 0) {
      if (time === this.minSelectedDate && this.minSelectedDate === this.maxSelectedDate) {
        return 'circle';
      }
      if (time === this.minSelectedDate) {
        return 'start';
      }else if (time === this.maxSelectedDate) {
        return 'end';
      }else if (time > this.minSelectedDate && time < this.maxSelectedDate) {
        return 'in';
      }else {
        return '';
      }
    }
  }
  renderCalendar() {
    this.tablePrevRows = this.generateRows(this.startDate);
    this.tableNextRows = this.generateRows(this.endDate);
  }
  buildFirstRow(firstDay: number, lastMonthDayCount: number, date: Date): DateRangeItem[] {
    const year = date.getFullYear(), month = date.getMonth();
    return [0, 1, 2, 3, 4, 5, 6].map((num) => {
      if (num >= firstDay) {
        const cur = new Date(year, month, num - firstDay + 1).getTime();
        return {
          day: num - firstDay + 1,
          monthOffset: 0,
          year: year,
          month: month,
          time: cur
        };
      }else {
        const cur = new Date(month - 1 < 0 ? year - 1 : year, month - 1 < 0 ? 11 : month - 1, lastMonthDayCount + num - firstDay + 1).getTime();
        return {
          day: lastMonthDayCount + num - firstDay + 1,
          monthOffset: -1,
          year: month - 1 < 0 ? year - 1 : year,
          month: month - 1 < 0 ? 11 : month - 1,
          time: cur
        };
      }
    });
  }
  generateRows(time: Date | number): Array<DateRangeItem[]> {
    const date = DateFormatService.checkedDate(time);
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth();
    const lastMonth = date.getMonth() - 1;
    const lastYear = lastMonth < 0 ? date.getFullYear() - 1 : date.getFullYear();
    const currentMonthdayCount = DateFormatService.getDayCountOfMonth(date.getFullYear(), date.getMonth());
    const lastMonthDayCount = DateFormatService.getDayCountOfMonth(lastYear, lastMonth < 0 ? 12 : lastMonth);
    const firstDay = DateFormatService.getFirstDayOfMonth(date);
    let nextMonthDay = 0;
    return [[], [], [], [], [], []].map((row, index) => {
      if (index === 0) {
        return this.buildFirstRow(firstDay, lastMonthDayCount, date);
      }
      const thisWeekFirstDay = 7 - firstDay + 7 * (index - 1);
      return new Array(7).fill(0).map((v, i) => {
        const start = thisWeekFirstDay + i + 1;
        if (start <= currentMonthdayCount) {
          return {
            day: start,
            monthOffset: 0,
            time: new Date(currentYear, currentMonth, start).getTime(),
            year: currentYear,
            month: currentMonth
          };
        }
        nextMonthDay ++;
        return {
          day: nextMonthDay,
          monthOffset: 1,
          time: new Date(currentMonth + 1 > 11 ? currentYear + 1 : currentYear, currentMonth + 1 > 11 ? 0 : currentMonth + 1, nextMonthDay).getTime(),
          year: currentMonth + 1 > 11 ? currentYear + 1 : currentYear,
          month: currentMonth + 1 > 11 ? 0 : currentMonth + 1
        };
      });
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.start && !changes.start.isFirstChange()) {
      this.dateChange();
    }
    if (changes && changes.end && !changes.end.isFirstChange()) {
      this.dateChange();
    }
  }
  dateChange() {
    if (this.start) {
      const startDate = new Date(this.start);
      this.startDate = startDate;
      this.currentStartHour = startDate.getHours() < 10 ? '0' + startDate.getHours() : '' + startDate.getHours();
      this.currentStartMinutes = startDate.getMinutes() < 10 ? '0' + startDate.getMinutes() : '' + startDate.getMinutes();
      this.currentStartSecond = startDate.getSeconds() < 10 ? '0' + startDate.getSeconds() : '' + startDate.getSeconds();
      this.minSelectedDate = this.maxSelectedDate = startDate.getTime() - startDate.getHours() * this.hourMilliSecond - startDate.getMinutes() * this.minutesMilliSecond - startDate.getSeconds() * 1000 - startDate.getMilliseconds();
    }else {
      this.startDate = new Date();
    }
    if (this.end) {
      const endDate = new Date(this.end);
      this.currentEndHour = endDate.getHours() < 10 ? '0' + endDate.getHours() : '' + endDate.getHours();
      this.currentEndMinutes = endDate.getMinutes() < 10 ? '0' + endDate.getMinutes() : '' + endDate.getMinutes();
      this.currentEndSecond = endDate.getSeconds() < 10 ? '0' + endDate.getSeconds() : '' + endDate.getSeconds();
      this.maxSelectedDate = endDate.getTime() - endDate.getHours() * this.hourMilliSecond - endDate.getMinutes() * this.minutesMilliSecond - endDate.getSeconds() * 1000 - endDate.getMilliseconds();
    }else {
      this.maxSelectedDate = this.minSelectedDate;
    }
    const startDateYear = this.startDate.getFullYear();
    const startDateMonth = this.startDate.getMonth();
    this.endDate = new Date(startDateMonth + 1 > 11 ? startDateYear + 1 : startDateYear, startDateMonth + 1 > 11 ? 0 : startDateMonth + 1, this.startDate.getDate());
    this.renderCalendar();
  }
  mouseOverHandle(item: DateRangeItem) {
    if (this.currentStatus === 'end') {
      let time = item.time;
      if ((this.minTime && time < this.minTime) || (this.maxTime && time > this.maxTime)) {
        const today = new Date();
        time = today.getTime() - today.getHours() * 60 * 60 * 1000 - today.getMinutes() * 60 * 1000 - today.getSeconds() * 1000 - today.getMilliseconds();
      }
      this.minSelectedDate = this.originClickDate;
      if (time >= this.minSelectedDate) {
        if (time - this.minSelectedDate > this.maxRange) {
          this.maxSelectedDate = this.minSelectedDate + this.maxRange;
        }else {
          this.maxSelectedDate = time;
        }
      }else {
        this.maxSelectedDate = this.originClickDate;
        if (this.maxSelectedDate - time > this.maxRange) {
          this.minSelectedDate = this.maxSelectedDate - this.maxRange;
        }else {
          this.minSelectedDate = time;
        }
      }
    }
  }
  clickHandle(item: DateRangeItem) {
    const time = item.time;
    if (this.currentStatus === 'start') {
      const today = new Date();
      const todayTime = today.getTime() - today.getHours() * 60 * 60 * 1000 - today.getMinutes() * 60 * 1000 - today.getSeconds() * 1000 - today.getMilliseconds();
      this.currentStatus = 'end';
      if ((this.minTime && time < this.minTime) || (this.maxTime && time > this.maxTime)) {
        this.originClickDate = this.minSelectedDate = this.maxSelectedDate = todayTime;
      }else {
        this.originClickDate = this.minSelectedDate = this.maxSelectedDate = time;
      }
    }else if (this.currentStatus === 'end') {
      this.currentStatus = 'start';
    }
  }
  clearHandle() {
    this.start = null;
    this.end = null;
    this.minSelectedDate = this.maxSelectedDate = null;
    this.currentStartHour = '00';
    this.currentEndHour = '00';
    this.currentStartMinutes = '00';
    this.currentEndMinutes = '00';
    this.currentStartSecond = '00';
    this.currentEndSecond = '00';
    this.startChange.emit(this.start);
    this.endChange.emit(this.end);
    this.show = false;
    this.showChange.emit(this.show);
  }
  confirmHandle() {
    this.start = this.minSelectedDate + parseInt(this.currentStartHour, 10) * 60 * 60 * 1000 + parseInt(this.currentStartMinutes, 10) * 60 * 1000 + parseInt(this.currentStartSecond, 10) * 1000;
    this.end =  (this.currentStatus === 'start' ? this.maxSelectedDate : this.minSelectedDate) + parseInt(this.currentEndHour, 10) * 60 * 60 * 1000 + parseInt(this.currentEndMinutes, 10) * 60 * 1000 + parseInt(this.currentEndSecond, 10) * 1000;
    if (this.currentStatus !== 'start') {
      this.currentStatus = 'start';
    }
    if (this.start > this.end) {
      this.hasError = true;
    }else {
      this.hasError = false;
      this.startChange.emit(this.start);
      this.endChange.emit(this.end);
      this.show = false;
      this.showChange.emit(this.show);
    }
  }
}
