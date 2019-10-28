import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import {CeInventory, HaInventory} from '../../../shared/sdwan';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CeService} from '../../../shared/sdwan/ce.service';
import {findCityByProvince, findProvivceByCountry, NodeMap} from '../../../model';
import {COMMON_PATTERN} from '../../../model/utils';

@Component({
  selector: 'app-ha-resource-quota',
  templateUrl: './ha-resource-quota.component.html',
  styleUrls: ['./ha-resource-quota.component.styl']
})
export class HaResourceQuotaComponent implements OnInit {
  @Input()
    selectedHa: HaInventory;
  @Output()
    done: EventEmitter<any> = new EventEmitter();
  resourceQuotaForm: FormGroup;

  dialogOptions = {
    title: '配额设置',
    width: '400px',
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
    this.resourceQuotaForm = this.fb.group({
      serviceCidrNum: ['', [Validators.required, Validators.pattern(COMMON_PATTERN.number)]],
    });
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.ceService.getResourceQuota(this.selectedHa.uuid, 'HaGroupVO', rets => {
      this.resourceQuotaForm.patchValue({
        serviceCidrNum: rets.serviceCidrNum,
      });
    });
  }

  get serviceCidrNum() {
    return this.resourceQuotaForm.get('serviceCidrNum');
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const infoPage = {
      resourceUuid: this.selectedHa.uuid,
      resourceType: 'HaGroupVO',
      resourceQuotas: [
        {
          'type': 'ServiceCidrVO',
          'num': parseFloat(this.serviceCidrNum.value)
        }
      ]
    };
    this.done.emit(infoPage);
    this.dialogOptions.visible = false;
  }

}
