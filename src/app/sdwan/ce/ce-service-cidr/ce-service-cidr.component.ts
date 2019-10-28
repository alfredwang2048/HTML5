import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';

@Component({
  selector: 'app-ce-service-cidr',
  templateUrl: './ce-service-cidr.component.html',
  styleUrls: ['./ce-service-cidr.component.styl']
})
export class CeServiceCidrComponent implements OnInit {
  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  selectedCe: CeInventory;
  @Input()
    selectedItem: any;

  dialogOptions = {
    title: '配置业务网段',
    width: '450px',
    visible: false,
    changeHeight: 0
  };
  model = {
    cidr: '',
    ceUuid: '',
    cidrUuid: ''
  };
  currentIpCidr = null;
  constructor(
  ) { }

  ngOnInit() {
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.model = {
      cidr: '',
      ceUuid: '',
      cidrUuid: ''
    };
    this.currentIpCidr = null;
    if (this.selectedItem) {
      this.currentIpCidr = this.selectedItem;
      this.model.cidr = this.currentIpCidr.cidr;
    }
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    this.model.ceUuid = this.selectedCe.uuid;
    if (this.currentIpCidr) {
      this.model.cidrUuid = this.currentIpCidr.uuid;
      this.done.emit({type: 'update', params: this.model});
    }else {
      this.done.emit({type: 'create', params: this.model});
    }
    this.dialogOptions.visible = false;
  }

}
