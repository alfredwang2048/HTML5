import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-window',
  templateUrl: './loading-window.component.html',
  styleUrls: ['./loading-window.component.styl']
})
export class LoadingWindowComponent implements OnInit {

  dialogOptions = {
    width: '300px',
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
  }

}
