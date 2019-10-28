import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-jump',
  templateUrl: './jump.component.html',
  styleUrls: ['./jump.component.styl']
})
export class JumpComponent implements OnInit {
  @Input()
  current: number;
  @Input()
  max: number;
  @Output()
  next: EventEmitter<number> = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }
  changeHandler(jump: number) {
    if (isNaN(jump)) {
      jump = 1;
    }
    if (jump < 1) {
      jump = 1;
    }
    const next = Math.round(Math.min(+ jump, this.max));
    const skip = next - this.current;
    this.current = next;
    this.next.emit(skip);
  }
}
