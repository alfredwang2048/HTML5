import { Component,
  Input,
  Output,
  EventEmitter,
  OnChanges } from '@angular/core';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.styl']
})
export class SidebarComponent implements OnChanges {
  @Input()
  model: Array<Model>;
  @Input()
  selectedIndex = -1;
  @Input()
  toggleType: string;
  @Output()
  toggleMenu: EventEmitter<{toggle: string, width: string}> = new EventEmitter();
  @Input()
  width = '110px';
  constructor() { }
  ngOnChanges() {
    this.width = this.toggleType === 'mini' ? '36px' : '110px';
  }
  toggle() {
    const options = this.toggleType === 'mini' ? { toggle: 'normal', width: '110px'} : { toggle: 'mini', width: '36px'};
    this.toggleMenu.emit(options);
  }
}
export interface Model {
  text: string;
  iconClass: string;
  selected: boolean;
  href: string;
  main: string;
}
