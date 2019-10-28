import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-ce-update-application-link',
  templateUrl: './ce-update-application-link.component.html',
  styleUrls: ['./ce-update-application-link.component.styl']
})
export class CeUpdateApplicationLinkComponent implements OnInit {

  @Input()
    app: any;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();

  dialogOptions = {
    title: '修改应用链路',
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
    });
  }

  openDialog() {
    this.dialogOptions.visible = true;
    setTimeout(() => {
      this.applicationLinkForm.reset({
        name: this.app.name,
      });
    });
  }

  get name () {
    return this.applicationLinkForm.get('name');
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    this.done.emit({
      uuid: this.app.uuid,
      name: this.name.value
    });
    this.dialogOptions.visible = false;
  }

}
