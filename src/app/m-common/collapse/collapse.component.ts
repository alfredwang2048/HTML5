import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { dropAnimation } from '../animation';
@Component({
  selector: 'app-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.styl'],
  animations: [dropAnimation]
})
export class CollapseComponent implements OnInit {
  @Input()
  ospfTitltInput = false;

  @Input('collapse-title')
  title: string;
  @Input()
  collapseOn = true;
  @Output()
  collapseOnChange: EventEmitter<boolean> = new EventEmitter();
  @Input()
  hasBorder = false;
  @Input()
  inputItem: any;
  @Input()
  isSub  = false;
  @Input()
  iconVisible = true;
  @Input()
  chartVisible = false;
  @Output()
  done: EventEmitter<any> = new EventEmitter();
  constructor() { }
  ngOnInit() {
  }
  clickHandler() {
    this.collapseOn = !this.collapseOn;
    this.collapseOnChange.emit(this.collapseOn);
  }
  clickEvent(e) {
    e.stopPropagation();
    this.done.emit();
  }
  clickChart(e) {
    e.stopPropagation();
    this.done.emit({type: 'queryChart', current: this.inputItem});
  }
}
