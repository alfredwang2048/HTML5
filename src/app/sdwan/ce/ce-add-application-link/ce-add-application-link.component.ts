import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-ce-add-application-link',
  templateUrl: './ce-add-application-link.component.html',
  styleUrls: ['./ce-add-application-link.component.styl']
})
export class CeAddApplicationLinkComponent implements OnInit {

  @Input()
    selectedCe: CeInventory;
  @Input()
    ailLinks: any;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();

  dialogOptions = {
    title: '新增应用链路',
    width: '450px',
    visible: false,
    changeHeight: 0
  };
  applicationLinkForm: FormGroup;
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
      popUuid: ['', Validators.required]
    });
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.applicationLinkForm.reset({
      name: '',
      popUuid: ''
    });
  }

  get name () {
    return this.applicationLinkForm.get('name');
  }

  get popUuid () {
    return this.applicationLinkForm.get('popUuid');
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    this.done.emit({
      ceUuid: this.selectedCe.uuid,
      name: this.name.value,
      popUuid: this.popUuid.value
    });
    this.dialogOptions.visible = false;
  }

}
