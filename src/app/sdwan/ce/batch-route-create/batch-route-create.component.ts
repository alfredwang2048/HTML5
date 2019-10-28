import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {COMMON_PATTERN, validatorIP} from '../../../model/utils';

@Component({
  selector: 'app-batch-route-create',
  templateUrl: './batch-route-create.component.html',
  styleUrls: ['./batch-route-create.component.styl']
})
export class BatchRouteCreateComponent implements OnInit {

  @Input()
    selectedCe: CeInventory;
  @Input()
    totalNum: number;
  @Input()
    currentNum: number;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();
  dialogOptions = {
    title: '添加静态路由',
    width: '530px',
    visible: false,
    changeHeight: 0
  };
  createCeRouteForm: FormGroup;
  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.createCeRouteForm = this.fb.group({
      destination: ['', [Validators.required, validatorIP()]],
      nexthop: ['', [Validators.required, Validators.pattern(COMMON_PATTERN.ip)]],
    });
  }

  resetForm() {
    this.createCeRouteForm.reset({
      destination: '',
      nexthop: '',
    });
  }

  get destination() {
    return this.createCeRouteForm.get('destination');
  }

  get nexthop() {
    return this.createCeRouteForm.get('nexthop');
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.resetForm();
  }

  close() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const destinationArr: any = validatorIP(false)(this.destination);
    const infoPage = {
      ceUuid: this.selectedCe.uuid,
      destinations: destinationArr,
      nexthop: this.nexthop.value,
    };
    this.dialogOptions.visible = false;
    this.done.emit(infoPage);
  }

}
