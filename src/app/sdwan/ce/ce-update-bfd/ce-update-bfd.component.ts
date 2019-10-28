import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CeInventory, CeService} from '../../../shared/sdwan';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {COMMON_PATTERN} from '../../../model/utils';

@Component({
  selector: 'app-ce-update-bfd',
  templateUrl: './ce-update-bfd.component.html',
  styleUrls: ['./ce-update-bfd.component.styl']
})
export class CeUpdateBfdComponent implements OnInit {
  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  selectedCe: CeInventory;
  selectedBfd: any;

  dialogOptions = {
    title: 'BFD设置',
    width: '450px',
    visible: false,
    changeHeight: 0
  };
  updateCeBgpForm: FormGroup;
  bfdState: boolean;
  constructor(
    private fb: FormBuilder,
    private ceService: CeService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.getBfd(this.selectedCe.uuid).then(data => {
      this.selectedBfd = data;
      this.resetForm();
      this.bfdState = this.selectedBfd.bfdState === 'Enabled';
      this.setValidator(this.bfdState);
    });
  }

  getBfd(ceUuid) {
    return new Promise((res, reject) => {
      this.ceService.getBfd(ceUuid, (data) => {
        res(data);
      });
    });
  }

  createForm() {
    this.updateCeBgpForm = this.fb.group({
      recInterval: ['', [Validators.required, Validators.min(100), Validators.max(1000), Validators.pattern(COMMON_PATTERN.number)]],
      transInterval: ['', [Validators.required, Validators.min(100), Validators.max(1000), Validators.pattern(COMMON_PATTERN.number)]],
    });
  }

  resetForm() {
    this.updateCeBgpForm.patchValue({
      recInterval: this.selectedBfd.recInterval,
      transInterval: this.selectedBfd.transInterval,
    });
  }

  setValidator(bfdState) {
    if (bfdState) {
      this.recInterval.setValidators([Validators.required, Validators.min(100), Validators.max(1000), Validators.pattern(COMMON_PATTERN.number)]);
      this.transInterval.setValidators([Validators.required, Validators.min(100), Validators.max(1000), Validators.pattern(COMMON_PATTERN.number)]);
      this.recInterval.updateValueAndValidity();
      this.transInterval.updateValueAndValidity();
    }else {
      this.recInterval.setValidators(null);
      this.transInterval.setValidators(null);
      this.recInterval.updateValueAndValidity();
      this.transInterval.updateValueAndValidity();
    }
  }

  get recInterval() {
    return this.updateCeBgpForm.get('recInterval');
  }

  get transInterval() {
    return this.updateCeBgpForm.get('transInterval');
  }

  changeStateDone(state) {
    this.bfdState = state;
    this.setValidator(state);
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const infoPage = {
      uuid: this.selectedBfd.uuid,
      bfdState: this.bfdState ? 'Enabled' : 'Disabled'
    };
    if (this.bfdState) {
      Object.assign(infoPage, {
        recInterval: Number.parseInt(this.recInterval.value),
        transInterval: Number.parseInt(this.transInterval.value),
      });
    }
    this.done.emit(infoPage);
    this.dialogOptions.visible = false;
  }

}
