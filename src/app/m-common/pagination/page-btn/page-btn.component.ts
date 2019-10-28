import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-btn',
  templateUrl: './page-btn.component.html',
  styleUrls: ['./page-btn.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageBtnComponent {
  @Input()
  dir: 'left' | 'right';
  @Input()
  disabled = false;
  @Output()
  next: EventEmitter<number> = new EventEmitter();
  constructor() { }
  clickHandler(skip: number) {
    if (this.disabled) {
      return;
    }
    this.next.emit(skip);
  }
}
