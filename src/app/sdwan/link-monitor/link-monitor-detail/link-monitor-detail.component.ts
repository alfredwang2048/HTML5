import {Component, Input, OnInit} from '@angular/core';
import {VPELinkMonitorInventory} from '../../../shared/sdwan';

@Component({
  selector: 'app-link-monitor-detail',
  templateUrl: './link-monitor-detail.component.html',
  styleUrls: ['./link-monitor-detail.component.styl']
})
export class LinkMonitorDetailComponent implements OnInit {

  @Input()
  selectedItem: VPELinkMonitorInventory;
  modelOption = {
    width: '500px',
    title: '详情',
    toggle: false
  };
  constructor() { }

  ngOnInit() {
  }
  open() {
    this.modelOption.toggle = true;
  }

}
