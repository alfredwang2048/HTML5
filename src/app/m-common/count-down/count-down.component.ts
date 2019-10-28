import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnChanges,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
@Component({
  selector: 'app-count-down',
  templateUrl: './count-down.component.html',
  styleUrls: ['./count-down.component.styl'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CountDownComponent),
    multi: true
  }],
})
export class CountDownComponent implements OnInit , OnChanges{
  @Input()
    content: number | string;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();
  isDisabled = false;
  initValue = 60;
  timer = 0;
  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.content && changes.content.currentValue) {
      this.reset();
      clearInterval(this.timer);
    }
  }

  reset() {
    this.content = '免费获取验证码';
    this.isDisabled = false;
  }

  start() {
    this.done.emit('click');
    this.isDisabled = true;
    this.timer = setInterval(() => {
      if (this.initValue < 0) {
        this.reset();
        clearInterval(this.timer);
      }else {
        this.content = this.initValue;
        this.initValue--;
      }
    }, 1000);
  }
}
class Model {
  name: string;
  value: string | number;
}
