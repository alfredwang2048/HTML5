import { Component, OnDestroy } from '@angular/core';
import { MessageAnimation, MessageItemAnimation } from './message.animation';
import { Message } from './msg.service';
@Component({
  selector: 'app-message',
  // template: `<ul class="message-container" [@messageAnimation]="toggle">
  template: `<ul class="message-container">
    <li *ngFor="let msg of messages;let i = index"
        [class]="'message ' + 'message-'+(msg.type?msg.type:defaultType)"
        (mouseenter)="clearTimer(i)" (mouseleave)="startTimer(i)" [@messageItemAnimation]="'in'">
      <i *ngIf="false" [class]="'sysicon-'+(msg.type?msg.type:defaultType)"></i>
      <p>{{msg.msg}}</p>
      <span class="close icon iconfont icon-sm-close" *ngIf="showClose" (click)="close(i)"></span>
    </li>
  </ul>`,
  styleUrls: ['./message.component.styl'],
  animations: [MessageAnimation, MessageItemAnimation]
})
export class MessageComponent implements OnDestroy {
  id: string;
  defaultType = 'info';
  showClose = true;
  duration = 5000;
  toggle = false;
  messages: Message[] = [];
  timers = [];
  constructor() {}
  show(message: Message) {
    if (!this.toggle) {
      this.toggle = true;
    }
    this.messages.push(message);
    const timer = setTimeout(() => {
      const index = this.timers.findIndex(t => t === timer);
      this.close(index);
    }, this.duration);
    this.timers.push(timer);
  }
  close(index) {
    clearTimeout(this.timers[index]);
    this.messages.splice(index, 1);
    this.timers.splice(index, 1);
    if (this.messages.length === 0) {
      this.toggle = false;
    }
    this.onClose();
  }
  clearTimer(index) {
    clearTimeout(this.timers[index]);
  }
  startTimer(index) {
    this.clearTimer(index);
    this.timers[index] = setTimeout(() => {
      this.close(index);
    }, this.duration);
  }
  ngOnDestroy() {
    this.onDestroy();
  }
  onDestroy: Function = () => {};
  onClose: Function = () => {};
}
