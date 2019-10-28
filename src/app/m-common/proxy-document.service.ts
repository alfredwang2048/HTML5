import { Injectable } from '@angular/core';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { DaterangepickerComponent } from './daterangepicker/daterangepicker.component';
import { CascaderComponent } from './cascader/cascader.component';
@Injectable()
export class ProxyDocumentService {
  private dateRangePickers: Array<DaterangepickerComponent> = [];
  private datePickers: Array<DatepickerComponent> = [];
  private cascaders: Array<CascaderComponent> = [];
  constructor() { }
  addComponent(type, com) {
    switch (type) {
      case 'daterange':
        this.dateRangePickers.push(com);
        break;
      case 'datepicker':
        this.datePickers.push(com);
        break;
      case 'cascader':
        this.cascaders.push(com);
        break;
    }
  }
  deleteComponent(type, uuid) {
    switch (type) {
      case 'daterange':
        this.dateRangePickers = this.dateRangePickers.filter(item => item.uuid !== uuid);
        break;
      case 'datepicker':
        this.datePickers = this.datePickers.filter(item => item.uuid !== uuid);
        break;
      case 'cascader':
        this.cascaders = this.cascaders.filter(item => item.uuid !== uuid);
        break;
    }
  }
  closeComponent() {
    this.datePickers.forEach(item => {
      item.showPanelPicker = false;
    });
    this.dateRangePickers.forEach(item => {
      item.showPanel = false;
    });
    this.cascaders.forEach((item) => {
      item.menuVisible = false;
    });
  }
}
