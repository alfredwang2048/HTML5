import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-common-window',
  templateUrl: './common-window.component.html',
  styleUrls: ['./common-window.component.styl']
})
export class CommonWindowComponent implements OnInit {
  @Input()
  title: string;

  @Input()
  width = '400px';

  @Input()
  tips: string;

  @Input()
  message: string;

  @Input()
  otherMessage: string;

  @Output()
  done: EventEmitter<any> = new EventEmitter();

  @Output()
  cancelDone: EventEmitter<any> = new EventEmitter();
  dialogOptions = {
    visible: false
  };
  constructor() { }

  ngOnInit() {
  }

  open() {
    this.dialogOptions.visible = true;
  }

  cancel() {
    this.dialogOptions.visible = false;
    if (this.cancelDone) {
      this.cancelDone.emit();
    }
  }

  confirm() {
    this.dialogOptions.visible = false;
    this.done.emit();
  }
}
