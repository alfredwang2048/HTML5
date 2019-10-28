import { Injectable } from '@angular/core';

@Injectable()
export class DateFormatService {

  constructor() { }
  static checkedDate(date: number | Date): Date {
    return typeof date === 'number' ? new Date(date) : date;
  }
  static getDayCountOfMonth(year: number, month: number): number {
    const isLeapYear: boolean = year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    return [
      month === 1 && !isLeapYear,
      month === 1 && isLeapYear,
      !!([3, 5, 8, 10].find(num => num === month)),
      true
    ].reduce((pre, next, index) => pre ? pre : (next ? 28 + index : 0), 0);
  }
  static getFirstDayOfMonth(date: number | Date): number {
    const checkedDate = DateFormatService.checkedDate(date);
    checkedDate.setDate(1);
    return checkedDate.getDay();
  }
  static getCurrentMonthOffset(targetDate: number | Date): number | null {
    const checkedDate = DateFormatService.checkedDate(targetDate);
    const currentDate = new Date();
    if (currentDate.getFullYear() !== checkedDate.getFullYear()) {
      return null;
    }
    const offset: number = currentDate.getMonth() - checkedDate.getMonth();
    return (offset > 1 || offset < -1) ? null : offset;
  }
  static moment(input: any, format: string) {
    const date = new Date(input);
    if (String(date) === 'Invalid Date') {
      return '';
    }
    const makeReg: Function = (value: number | string): RegExp => new RegExp(`${value}`);
    const keys: string[] = ['M+', 'd+', 'h+', 'm+', 's+', 'q+', 'S'];
    const values: number[] = [
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      Math.floor((date.getMonth() + 3) / 3),
      date.getMilliseconds()
    ];
    if (/(y+)/.test(format)) {
      format = format.replace(/(y+)/, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    let len = 0, key: string, val: number;
    while (len < keys.length) {
      key = keys[len];
      val = values[len];
      if (makeReg(key).test(format)) {
        format = (<any>format).replace(makeReg(key), (RegExp.$1.length === 1) ? val : ('00' + val).substr(('' + val).length));
      }
      len ++;
    }
    return format;
  }
  getTime(input?: any): number {
    const date = new Date(input);
    if (String(date) === 'Invalid Date') {
      return 0;
    }
    return date.getTime();
  }
}
