import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {COMMON_PATTERN} from '../../../model/utils';

@Component({
  selector: 'app-qos-bandwidth',
  templateUrl: './qos-bandwidth.component.html',
  styleUrls: ['./qos-bandwidth.component.styl']
})
export class QosBandwidthComponent implements OnInit {
  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  selectedCe: CeInventory;
  @Input()
    selectedItem: any;

  dialogOptions = {
    title: 'WAN带宽配置',
    width: '450px',
    visible: false,
    changeHeight: 0
  };
  model = {
    ceUuid: '',
    bandwidth: '',
    type : 'wan'
  };
  isTunnel = false;
  constructor(
  ) { }

  ngOnInit() {
  }

  openDialog(current, isTunnel = false) {
    this.isTunnel = isTunnel;
    this.dialogOptions.visible = true;
    this.model = {
      bandwidth: '',
      ceUuid: '',
      type: isTunnel ? 'tunnel' : 'wan'
    };
    this.model.bandwidth = current;
    if (isTunnel) {
      this.dialogOptions.title = '专线带宽配置';
    }
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    this.model.ceUuid = this.selectedCe.uuid;
    this.dialogOptions.visible = false;
    this.done.emit(this.model);
  }

}
