import { Component, OnInit, Input, TemplateRef, ContentChild } from '@angular/core';

@Component({
  selector: 'app-grid-column',
  templateUrl: './grid-column.component.html',
  styleUrls: ['./grid-column.component.styl']
})
export class GridColumnComponent implements OnInit {
  @ContentChild('slot') slot: TemplateRef<any>;
  @ContentChild('header') headerSlot: TemplateRef<any>;
  @Input()
  field: string;
  @Input()
  header: string;
  @Input()
  renderHtml: boolean;
  @Input()
  width: string | number;
  constructor() { }

  ngOnInit() {
    if (!this.header) {
      this.header = this.field;
    }
  }
}
