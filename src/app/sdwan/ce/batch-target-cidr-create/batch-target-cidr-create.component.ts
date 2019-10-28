import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {validatorIP} from '../../../model/utils';

@Component({
  selector: 'app-batch-target-cidr-create',
  templateUrl: './batch-target-cidr-create.component.html',
  styleUrls: ['./batch-target-cidr-create.component.styl']
})
export class BatchTargetCidrCreateComponent implements OnInit {

  @Input()
    selectedCe: CeInventory;
  @Input()
    totalNum: number;
  @Input()
    currentNum: number;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();
  dialogOptions = {
    title: '添加目标网段',
    width: '530px',
    visible: false,
    changeHeight: 0
  };
  createCeTargetCidrForm: FormGroup;
  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.createCeTargetCidrForm = this.fb.group({
      targetCidrs: ['', [Validators.required, validatorIP()]]
    });
  }

  resetForm() {
    this.createCeTargetCidrForm.reset({
      targetCidrs: ''
    });
  }

  get targetCidrs() {
    return this.createCeTargetCidrForm.get('targetCidrs');
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
      targetCidrs: validatorIP(false)(this.targetCidrs)
    };
    this.dialogOptions.visible = false;
    this.done.emit(infoPage);
  }

}
