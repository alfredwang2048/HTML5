import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pager',
  templateUrl: './pager.component.html',
  styleUrls: ['./pager.component.styl']
})
export class PagerComponent implements OnInit, OnChanges {
  @Input()
  current: number;
  @Input()
  count: number;
  @Output()
  next: EventEmitter<number> = new EventEmitter();
  pagers: Array<Pager>;
  constructor() { }

  ngOnInit() {
    this.makePager(this.current, this.count);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (!changes) {
      return;
    }
    this.makePager(this.current, this.count);
  }
  makePager(current, count, btnNum = 5) {
    const pages = [];
    if (count <= btnNum) {
      for (let i = 1; i <= count; i++) {
        if (i === current) {
          pages.push({number: i, isCurrent: true, isEllipsis: false});
        }else {
          pages.push({number: i, isCurrent: false, isEllipsis: false});
        }
      }
    }else {
      const num = btnNum - 1;
      const leftBtnNum = Math.ceil(num / 2);
      const leftPage = current - leftBtnNum < 1 ? 1 : current - leftBtnNum;
      const rightPage = leftPage + num > count ? count : leftPage + num;
      if (leftPage > 2) {
        pages.push({number: 1, isCurrent: false, isEllipsis: false});
        pages.push({number: 'left', isCurrent: false, isEllipsis: true});
      }else if (leftPage === 2) {
        pages.push({number: 1, isCurrent: false, isEllipsis: false});
      }
      for (let left = leftPage; left < current; left ++) {
        pages.push({number: left, isCurrent: false, isEllipsis: false});
      }
      pages.push({number: current, isCurrent: true, isEllipsis: false});
      for (let i = current + 1; i <= rightPage; i ++) {
        pages.push({number: i, isCurrent: false, isEllipsis: false});
      }
      if (rightPage < count - 1) {
        pages.push({number: 'right',  isCurrent: false, isEllipsis: true});
        pages.push({number: count,  isCurrent: false, isEllipsis: false});
      }else if (rightPage === count - 1) {
        pages.push({number: count,  isCurrent: false, isEllipsis: false});
      }
    }
    this.pagers = pages;
  }
  clickHandler(pager: Pager) {
    if (!pager.isEllipsis && !pager.isCurrent) {
      this.next.emit(<number>pager.number - this.current);
    }
  }
}
class Pager {
  number: number | 'left' | 'right';
  isCurrent: boolean;
  isEllipsis: boolean;
}
