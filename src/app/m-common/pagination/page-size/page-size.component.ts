import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-size',
  templateUrl: './page-size.component.html',
  styleUrls: ['./page-size.component.styl']
})
export class PageSizeComponent implements OnInit {
  @Input('size')
  currentSize: number;
  @Input()
  sizes: Array<number>;
  @Output()
  sizeChange: EventEmitter<number> = new EventEmitter();
  options: Array<{name: number, value: string}>;
  constructor() { }

  ngOnInit() {
    this.options = this.sizes.map((item) => {
      return {
        name: item,
        value: item + '条/页'
      };
    });
  }
  changeHandler(size: number) {
    this.sizeChange.emit(size);
  }
}
