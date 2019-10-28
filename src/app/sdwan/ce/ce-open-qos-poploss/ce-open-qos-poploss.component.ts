import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {CeService} from '../../../shared/sdwan';
import {COMMON_PATTERN} from '../../../model/utils';

@Component({
  selector: 'app-ce-open-qos-poploss',
  templateUrl: './ce-open-qos-poploss.component.html',
  styleUrls: ['./ce-open-qos-poploss.component.styl']
})
export class CeOpenQosPoplossComponent implements OnInit {
  @Output()
  done: EventEmitter<any> = new EventEmitter();
  @Input()
  selectedLossRate: number;
  updateCeForm;

  dialogOptions = {
    title: '开启链路优化',
    width: '450px',
    visible: false,
    changeHeight: 0
  };

  constructor(
    private fb: FormBuilder,
    private ceService: CeService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.updateCeForm = this.fb.group({
      lossRate: ['', [Validators.required, Validators.min(2), Validators.max(50), Validators.pattern(COMMON_PATTERN.number)]],
    });
  }

  get lossRate() {
    return this.updateCeForm.get('lossRate');
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.updateCeForm.patchValue({
      lossRate: this.selectedLossRate || 5,
    });
  }


  cancel() {
    this.dialogOptions.visible = false;
    this.done.emit({type: 'cancel', data: null});
  }

  confirm() {
    this.done.emit({type: 'confirm', data: this.lossRate.value});
    this.dialogOptions.visible = false;
  }

}
