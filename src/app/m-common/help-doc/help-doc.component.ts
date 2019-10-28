import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-help-doc',
  templateUrl: './help-doc.component.html',
  styleUrls: ['./help-doc.component.styl']
})
export class HelpDocComponent implements OnInit {

  @Input()
  title: string;
  @Input()
  docContent: any;
  @Input()
  docHrefContent: any;

  constructor() {
  }

  ngOnInit() {
  }

}
