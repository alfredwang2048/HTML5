import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {CeInventory, CeService} from '../../../shared/sdwan';
import {COMMON_PATTERN} from '../../../model/utils';

@Component({
  selector: 'app-ce-change-pop-type',
  templateUrl: './ce-change-pop-type.component.html',
  styleUrls: ['./ce-change-pop-type.component.styl']
})
export class CeChangePopTypeComponent implements OnInit {
  @Output()
  done: EventEmitter<any> = new EventEmitter();
  @Input()
  selectedCe: CeInventory;

  types = [];
  changePopTypeForm;

  dialogOptions = {
    title: '变更链路类型',
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
    this.changePopTypeForm = this.fb.group({
      type: ['', [Validators.required]],
    });
  }

  get type() {
    return this.changePopTypeForm.get('type');
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.reset();
    setTimeout(() => {
      this.types = this.selectedCe.popInfos.filter(item => item.lineType === 'VPN').map(item => {
        return {
          uuid: item.uuid,
          haType: item.haType,
          name: item.haType === 'Master' ? '主链路' : '备链路'
        };
      }).sort((a, b) => {
        return a.haType === 'Master' ? -1 : 1;
      });

      if (this.types.length) {
        this.changePopTypeForm.patchValue({
          type: this.types[0].uuid
        });
      }
    });
  }

  reset() {
    this.types = [];
    this.changePopTypeForm.reset({
      type: ''
    });
  }


  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    this.done.emit({uuid: this.type.value});
    this.dialogOptions.visible = false;
  }

}
