import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-month-table',
  templateUrl: './month-table.component.html',
  styleUrls: ['./month-table.component.styl']
})
export class MonthTableComponent implements OnInit, OnChanges {
  @Input()
  model: number;
  @Output()
  modelChange: EventEmitter<number> = new EventEmitter<number>();
  constructor() { }
  currentMonth: number;
  date: Date;
  monthRows: any[] = [
    ['一月', '二月', '三月', '四月'],
    ['五月', '六月', '七月', '八月'],
    ['九月', '十月', '十一月', '十二月'],
  ];

  clickHandle(i: number, k: number): void {
    const monthID = 4 * i + k;
    this.currentMonth = monthID;
    this.date.setMonth(monthID);
    this.modelChange.emit(this.date.getTime());
  }
  isCurrentMonth(i: number, k: number): boolean {
    return this.currentMonth === 4 * i + k;
  }

  ngOnInit(): void {
    this.date = new Date(this.model);
    this.currentMonth = this.date.getMonth();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.model && !changes.model.isFirstChange()) {
      this.model = changes.model.currentValue;
      this.date = new Date(this.model);
      this.currentMonth = this.date.getMonth();
    }
  }

}
