import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CeInventory, SdwanInventory} from '../../../shared/sdwan';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-network-add-app-model',
  templateUrl: './network-add-app-model.component.html',
  styleUrls: ['./network-add-app-model.component.styl']
})
export class NetworkAddAppModelComponent implements OnInit {

  @Input()
    selectedItem: SdwanInventory;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();

  dialogOptions = {
    title: '新增应用链路',
    width: '450px',
    visible: false,
    changeHeight: 0
  };
  applicationLinkForm: FormGroup;
  haTypes = [{text: '主链路', value: 'Master'}, {text: '备链路', value: 'Slave'}];
  constructor(
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.applicationLinkForm = this.fb.group({
      name: ['', Validators.required],
      haType: ['', Validators.required]
    });
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.applicationLinkForm.reset({
      name: '',
      haType: ''
    });
  }

  get name () {
    return this.applicationLinkForm.get('name');
  }

  get haType () {
    return this.applicationLinkForm.get('haType');
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    this.done.emit({
      sdwanNetworkUuid: this.selectedItem.uuid,
      name: this.name.value,
      haType: this.haType.value
    });
    this.dialogOptions.visible = false;
  }

}
