import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {COMMON_PATTERN} from '../../../model/utils';

@Component({
  selector: 'app-ce-application-link-detail-add',
  templateUrl: './ce-application-link-detail-add.component.html',
  styleUrls: ['./ce-application-link-detail-add.component.styl']
})
export class CeApplicationLinkDetailAddComponent implements OnInit {
  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  selectedItem: any;
  @Input()
    isModel = false;

  dialogOptions = {
    title: '新增应用定义',
    width: '450px',
    visible: false,
    changeHeight: 0
  };
  ailDetailAddForm: FormGroup;
  protocols = [{text: 'all', value: 'all'}, {text: 'tcp', value: 'tcp'}, {text: 'udp', value: 'udp'}];
  isShowTips = false;
  isTouched = true;
  constructor(
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.ailDetailAddForm = this.fb.group({
      destIp: [''],
      destPort: ['', [ Validators.pattern(COMMON_PATTERN.port)]],
      protocol: ['', Validators.required],
    });
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.ailDetailAddForm.reset({
      destIp: '',
      destPort: '',
      protocol: this.protocols[0].value
    });
    this.isShowTips = false;
    this.isTouched = true;
    this.destIp.valueChanges.subscribe((value) => {
      this.validatorRequired();
    });
    this.destPort.valueChanges.subscribe((value) => {
      this.validatorRequired();
    });
  }

  validatorRequired() {
    this.isTouched = false;
    if (!this.destIp.value.trim() && !this.destPort.value.trim()) {
      this.isShowTips = true;
    }else {
      this.isShowTips = false;
    }
  }

  get destIp () {
    return this.ailDetailAddForm.get('destIp');
  }

  get destPort () {
    return this.ailDetailAddForm.get('destPort');
  }

  get protocol () {
    return this.ailDetailAddForm.get('protocol');
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const infoPage = {
      appUuid: this.isModel ? '' : this.selectedItem.uuid,
      appModelUuid: this.isModel ? this.selectedItem.uuid : '',
      destIp: this.destIp.value,
      destPort: this.destPort.value,
      protocol: this.protocol.value
    };
    this.done.emit(infoPage);
    this.dialogOptions.visible = false;
  }

}
