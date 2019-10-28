import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-network-update-application-name',
  templateUrl: './network-update-application-name.html',
  styleUrls: ['./network-update-application-name.styl']
})
export class networkUpdateApplicationName implements OnInit {

  @Input()
    selectedAppItem: any;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();

  dialogOptions = {
    title: '修改应用链路',
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
    setTimeout(() => {
      this.applicationLinkForm.reset({
        name: this.selectedAppItem.name,
        haType: this.selectedAppItem.haType,
      });
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
      uuid: this.selectedAppItem.uuid,
      name: this.name.value,
      haType: this.haType.value,
    });
    this.dialogOptions.visible = false;
  }

}
