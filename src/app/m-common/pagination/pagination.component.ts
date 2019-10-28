import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.styl']
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input()
  dataTotal: number;
  @Input()
  pageSize = 10;
  @Input()
  pageSizes: Array<number> = [10, 20, 30, 50];
  @Input()
  pageTotal: number;
  @Input()
  currentPage = 1;
  @Output()
  currentPageChange: EventEmitter<number> = new EventEmitter();
  @Output()
  pageSizeChange: EventEmitter<number> = new EventEmitter();
  @Input()
  layout: Array<string> = ['prev', 'next', 'pager', 'total', 'jump', 'size'];
  hasPrev = true;
  hasNext = true;
  hasSize = true;
  hasTotal = true;
  hasJump = true;
  hasPager = true;
  constructor() { }
  ngOnInit() {
    if (this.pageTotal === undefined && this.dataTotal === undefined) {
      console.log('分页参数pageTotal或dataTotal需传其一');
    }
    this._update();
  }
  ngOnChanges(changes: {[prop: string]: SimpleChange}) {
    if (!changes || !changes.dataTotal || changes.dataTotal.isFirstChange()) {
      return;
    }
    this._update();
  }
  private _update() {
    if (this.dataTotal === undefined || this.dataTotal === null) {
      this.dataTotal = this.pageTotal * this.pageSize;
    }
    this.pageTotal = Math.ceil(this.dataTotal / this.pageSize) || 1;
    if (this.currentPage > this.pageTotal) {
      this.currentPage = this.pageTotal;
    }
    this.hasPrev = this.layout.includes('prev');
    this.hasNext = this.layout.includes('next');
    this.hasJump = this.layout.includes('jump');
    this.hasPager = this.layout.includes('pager');
    this.hasSize = this.layout.includes('size');
    this.hasTotal = this.layout.includes('total');
  }
  changePageHandler(step: number) {
    this.currentPage = this.currentPage + step;
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }else if (this.currentPage > this.pageTotal) {
      this.currentPage = this.pageTotal;
    }
    this.currentPageChange.emit(this.currentPage);
  }
  updateSize(size: number) {
    this.pageTotal = Math.ceil(this.dataTotal / size);
    /*this.currentPage = 1;
    this.currentPageChange.emit(this.currentPage);*/
    this.pageSizeChange.emit(size);
  }
}
