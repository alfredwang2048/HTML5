import { Component,
  OnInit,
  EventEmitter ,
  Input,
  Output,
  OnChanges,
  SimpleChanges } from '@angular/core';
import { DateFormatService } from '../../../../shared/date-format.service';
export interface DateRowItem {
  day: number;
  monthOffset: number;
}
@Component({
  selector: 'app-date-table',
  templateUrl: './date-table.component.html',
  styleUrls: ['./date-table.component.styl'],
  providers: [DateFormatService]
})
export class DateTableComponent implements OnInit, OnChanges {
  @Input()
  model: number;
  @Output()
  modelChange: EventEmitter<any> = new EventEmitter();
  weeks: string[] = ['日', '一', '二', '三', '四', '五', '六'];
  tableRows: Array<DateRowItem[]> = [[], [], [], [], [], []];
  targetDay: number;
  targetMonthOffset = 0; // default: current month, offset = 0
  date: Date;
  today: number;
  currentMonthOffset: number;
  constructor() { }
  static BuildFirstRow(firstDay: number, lastMonthDayCount: number): DateRowItem[] {
    return [0, 1, 2, 3, 4, 5, 6].map((num) => {
      if (num >= firstDay) {
        return { day: num - firstDay + 1, monthOffset: 0};
      }else {
        return { day: lastMonthDayCount + num - firstDay + 1, monthOffset: -1};
      }
    });
  }
  isToday(item: DateRowItem): boolean {
   if (this.currentMonthOffset === null) {
     return false;
   }
   return item.monthOffset === this.currentMonthOffset && this.today === item.day;
  }
  isTargetDay(item: DateRowItem): boolean {
    return item.monthOffset === this.targetMonthOffset && item.day === this.targetDay;
  }
  clickHandle(item: DateRowItem) {
    const date = this.date;
    const currentMonth = date.getMonth() + 1;
    const targetMonth = currentMonth + item.monthOffset;
    this.targetDay = item.day;
    this.targetMonthOffset = item.monthOffset;
    date.setMonth(targetMonth - 1);
    date.setDate(item.day);
    this.modelChange.emit(date.getTime());
  }
  getRows(): void {
    const date = this.date;
    this.targetDay = date.getDate();
    this.today = new Date().getDate();
    this.currentMonthOffset = DateFormatService.getCurrentMonthOffset(date);
    const lastMonth = date.getMonth() - 1;
    const lastYear = lastMonth < 0 ? date.getFullYear() - 1 : date.getFullYear();
    const currentMonthdayCount = DateFormatService.getDayCountOfMonth(date.getFullYear(), date.getMonth());
    const lastMonthDayCount = DateFormatService.getDayCountOfMonth(lastYear, lastMonth < 0 ? 12 : lastMonth);
    const firstDay = DateFormatService.getFirstDayOfMonth(date);
    let nextMonthDay = 0;
    this.tableRows = this.tableRows.map((row, index) => {
      if (index === 0) {
        return DateTableComponent.BuildFirstRow(firstDay, lastMonthDayCount);
      }
      const thisWeekFirstDay = 7 - firstDay + 7 * (index - 1);
      return new Array(7).fill(0).map((v, i) => {
        const start = thisWeekFirstDay + i + 1;
        if (start <= currentMonthdayCount) {
          return { day: start, monthOffset: 0};
        }
        nextMonthDay ++;
        return { day: nextMonthDay, monthOffset: 1};
      });
    });
  }
  ngOnInit() {
    this.date = new Date(this.model);
    this.getRows();
  }
  ngOnChanges(changes: SimpleChanges) {
    if ( changes && changes.model && !changes.model.isFirstChange()) {
      this.model = changes.model.currentValue;
      this.date = new Date(this.model);
      this.getRows();
    }
  }
}
