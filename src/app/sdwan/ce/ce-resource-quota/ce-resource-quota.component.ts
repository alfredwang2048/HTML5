import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CeService} from '../../../shared/sdwan/ce.service';
import {findCityByProvince, findProvivceByCountry, NodeMap} from '../../../model';
import {COMMON_PATTERN} from '../../../model/utils';

@Component({
  selector: 'app-ce-resource-quota',
  templateUrl: './ce-resource-quota.component.html',
  styleUrls: ['./ce-resource-quota.component.styl']
})
export class CeResourceQuotaComponent implements OnInit {
  @Input()
    selectedCe: CeInventory;
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
      routeNum: ['', [Validators.required, Validators.pattern(COMMON_PATTERN.number)]],
      targetCidrNum: ['', [Validators.required, Validators.pattern(COMMON_PATTERN.number)]],
      firewallNum: ['', [Validators.required, Validators.pattern(COMMON_PATTERN.number)]],
      qosNum: ['', [Validators.required, Validators.pattern(COMMON_PATTERN.number)]],
      appNum: ['', [Validators.required, Validators.pattern(COMMON_PATTERN.number)]],
      appDefinitionNum: ['', [Validators.required, Validators.pattern(COMMON_PATTERN.number)]],
    });
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.ceService.getResourceQuota(this.selectedCe.uuid, 'CeVO', rets => {
      this.resourceQuotaForm.patchValue({
        serviceCidrNum: rets.serviceCidrNum,
        targetCidrNum: rets.targetCidrNum,
        routeNum: rets.routeNum,
        firewallNum: rets.firewallNum,
        qosNum: rets.qosNum,
        appNum: rets.appNum,
        appDefinitionNum: rets.appDefinitionNum
      });
    });
  }

  get serviceCidrNum() {
    return this.resourceQuotaForm.get('serviceCidrNum');
  }

  get targetCidrNum() {
    return this.resourceQuotaForm.get('targetCidrNum');
  }

  get routeNum() {
    return this.resourceQuotaForm.get('routeNum');
  }

  get firewallNum() {
    return this.resourceQuotaForm.get('firewallNum');
  }

  get qosNum() {
    return this.resourceQuotaForm.get('qosNum');
  }

  get appNum() {
    return this.resourceQuotaForm.get('appNum');
  }

  get appDefinitionNum() {
    return this.resourceQuotaForm.get('appDefinitionNum');
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const infoPage = {
      resourceUuid: this.selectedCe.uuid,
      resourceType: 'CeVO',
      resourceQuotas: [
        {
          'type': 'CeRouteVO',
          'num': parseFloat(this.routeNum.value)
        },
        {
          'type': 'FirewallVO',
          'num': parseFloat(this.firewallNum.value)
        },
        {
          'type': 'CeQosRuleVO',
          'num': parseFloat(this.qosNum.value)
        },
        {
          'type': 'AppVO',
          'num': parseFloat(this.appNum.value)
        },
        {
          'type': 'AppDefinitionVO',
          'num': parseFloat(this.appDefinitionNum.value)
        }
      ]
    };
    if (this.selectedCe.l3Protocol === 'NAT') {
      infoPage.resourceQuotas.push({
        'type': 'CeNatTargetCidrVO',
          'num': parseFloat(this.targetCidrNum.value)
      });
    }
    if (this.selectedCe.connectionType === 'SDWAN' && this.selectedCe.l3Protocol === 'BGP') {
      infoPage.resourceQuotas.push({
        'type': 'ServiceCidrVO',
            'num': parseFloat(this.serviceCidrNum.value)
      });
    }
    this.done.emit(infoPage);
    this.dialogOptions.visible = false;
  }

}
