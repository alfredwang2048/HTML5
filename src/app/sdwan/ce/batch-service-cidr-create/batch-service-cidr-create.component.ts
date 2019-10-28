import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {validatorIP} from '../../../model/utils';

@Component({
  selector: 'app-batch-service-cidr-create',
  templateUrl: './batch-service-cidr-create.component.html',
  styleUrls: ['./batch-service-cidr-create.component.styl']
})
export class BatchServiceCidrCreateComponent implements OnInit {

  @Input()
    selectedCe: CeInventory;
  @Input()
    totalNum: number;
  @Input()
    currentNum: number;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();
  dialogOptions = {
    title: '添加业务网段',
    width: '530px',
    visible: false,
    changeHeight: 0
  };
  createCeServiceCidrForm: FormGroup;
  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.createCeServiceCidrForm = this.fb.group({
      cidr: ['', [Validators.required, validatorIP()]]
    });
  }

  resetForm() {
    this.createCeServiceCidrForm.reset({
      cidr: ''
    });
  }


  get cidr() {
    return this.createCeServiceCidrForm.get('cidr');
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.resetForm();
  }

  close() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const infoPage = {
      ceUuid: this.selectedCe.uuid,
      cidr: validatorIP(false)(this.cidr)
    };
    this.dialogOptions.visible = false;
    this.done.emit(infoPage);
  }

}
