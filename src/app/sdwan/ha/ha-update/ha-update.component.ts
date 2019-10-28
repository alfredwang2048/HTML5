import {Component, EventEmitter, OnInit, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HaService, HaInventory} from '../../../shared/sdwan';
import {CeService} from '../../../shared/sdwan/ce.service';
import {QueryObject} from '../../../base';

@Component({
  selector: 'app-ha-update',
  templateUrl: './ha-update.component.html',
  styleUrls: ['./ha-update.component.styl']
})
export class HaUpdateComponent implements OnInit {

  updateHaForm: FormGroup;
  dialogOptions = {
    title: '变更配置',
    width: '540px',
    visible: false
  };
  @Input()
  selectedHa: HaInventory;
  @Output()
  done: EventEmitter<HaInventory> = new EventEmitter();

  sdwanNetwork;
  ceList = [];
  ceList_A = [];
  ceList_B = [];
  cePortList_A = [];
  cePortList_B = [];
  showCeB = false;
  tips = {
    priorityTip: null,
  };
  isFirstSet = true;

  constructor(private fb: FormBuilder,
              private haService: HaService,
              private ceService: CeService) {
  }

  get name() {
    return this.updateHaForm.get('name');
  }

  get vrid() {
    return this.updateHaForm.get('vrid');
  }

  get vip1() {
    return this.updateHaForm.get('vip1');
  }

  get vip2() {
    return this.updateHaForm.get('vip2');
  }

  get vip3() {
    return this.updateHaForm.get('vip3');
  }

  get vip4() {
    return this.updateHaForm.get('vip4');
  }

  get vip5() {
    return this.updateHaForm.get('vip5');
  }

  get ceUuid_A() {
    return this.updateHaForm.get('ceUuid_A');
  }

  get ceUuid_B() {
    return this.updateHaForm.get('ceUuid_B');
  }

  get cePortUuid_A() {
    return this.updateHaForm.get('cePortUuid_A');
  }

  get cePortUuid_B() {
    return this.updateHaForm.get('cePortUuid_B');
  }

  get priority_A() {
    return this.updateHaForm.get('priority_A');
  }

  get priority_B() {
    return this.updateHaForm.get('priority_B');
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.updateHaForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(6)]],
      vrid: ['', [Validators.required, Validators.min(0), Validators.max(255)]],
      vip1: ['', [Validators.required, Validators.max(255), Validators.pattern('^[1-9]+\\d*$')]],
      vip2: ['', [Validators.required, Validators.max(255), Validators.pattern('^([1-9]\\d*|[0]{1,1})$')]],
      vip3: ['', [Validators.required, Validators.max(255), Validators.pattern('^([1-9]\\d*|[0]{1,1})$')]],
      vip4: ['', [Validators.required, Validators.max(255), Validators.pattern('^([1-9]\\d*|[0]{1,1})$')]],
      vip5: ['', [Validators.required, Validators.max(255), Validators.pattern('^([1-9]\\d*|[0]{1,1})$')]],
      ceUuid_A: [''],
      cePortUuid_A: [''],
      priority_A: ['', [Validators.min(2), Validators.max(254), Validators.pattern('^\\d*')]],
      ceUuid_B: [''],
      cePortUuid_B: [''],
      priority_B: ['', [Validators.min(2), Validators.max(254), Validators.pattern('^\\d*')]]
    });
  }

  open() {
    this.reset();
    this.dialogOptions.visible = true;
    const qobj = new QueryObject();
    qobj.addCondition({name: 'sdwanNetworkUuid', op: '=', value: this.selectedHa.sdwanNetworkUuid});
    this.haService.queryCe(qobj, (ce, total) => {
      this.ceList = ce;
      this.ceList_A = [{name: '请选择', uuid: ''}].concat(ce);
      if (this.selectedHa.haGroupCeRefs.length) {
        this.getCePort(this.selectedHa.haGroupCeRefs[0].ceUuid, 'A', false);
      }
    });
  }

  reset() {
    let str = this.selectedHa.vip + '.';
    str = str.replace('\/', '.');
    const n = str.match(/[0-9]+\./g);
    this.updateHaForm.setValue({
      name: this.selectedHa.name,
      vrid: this.selectedHa.vrid,
      vip1: n[0].substr(0, n[0].length - 1),
      vip2: n[1].substr(0, n[1].length - 1),
      vip3: n[2].substr(0, n[2].length - 1),
      vip4: n[3].substr(0, n[3].length - 1),
      vip5: n[4].substr(0, n[4].length - 1),
      ceUuid_A: this.selectedHa.haGroupCeRefs[0] ? this.selectedHa.haGroupCeRefs[0].ceUuid : '',
      cePortUuid_A: this.selectedHa.haGroupCeRefs[0] ? this.selectedHa.haGroupCeRefs[0].nic : '',
      priority_A: this.selectedHa.haGroupCeRefs[0] ? this.selectedHa.haGroupCeRefs[0].priority : '',
      ceUuid_B: this.selectedHa.haGroupCeRefs[1] ? this.selectedHa.haGroupCeRefs[1].ceUuid : '',
      cePortUuid_B: this.selectedHa.haGroupCeRefs[1] ? this.selectedHa.haGroupCeRefs[1].nic : '',
      priority_B: this.selectedHa.haGroupCeRefs[1] ? this.selectedHa.haGroupCeRefs[1].priority : ''
    });
    this.showCeB = this.selectedHa.haGroupCeRefs.length > 1 ? true : false;
    this.ceList = [];
    this.ceList_A = [];
    this.ceList_B = [];
    this.cePortList_A = [];
    this.cePortList_B = [];
    this.sdwanNetwork = null;
    this.tips = {
      priorityTip: null,
    };
    this.isFirstSet = true;
  }

  getCePort(ceUuid, type, ceAChange) {
    this.tips.priorityTip = null;
    if (ceUuid === '' && type === 'A') {
      this.cePortList_A = [];
      this.updateHaForm.patchValue({ceUuid_A: ''});
      this.updateHaForm.patchValue({cePortUuid_A: ''});
      this.updateHaForm.patchValue({priority_A: ''});
      this.ceList_B = [{name: '请选择', uuid: ''}];
      this.cePortList_B = [];
      this.updateHaForm.patchValue({ceUuid_B: ''});
      this.updateHaForm.patchValue({cePortUuid_B: ''});
      this.updateHaForm.patchValue({priority_B: ''});
    } else {
      this.ceService.getDetail(ceUuid, (detail) => {
        const cePortList = [];
        // detail.lanPortInventories.forEach((item) => {
        //   cePortList.push(item);
        // });
        detail.wanPortInventories.forEach((item) => {
          if (item.ipCidr && item.ipCidr !== '') {
            item['showName'] = item.name + ' (ipCidr:' + item.ipCidr + ')';
            cePortList.push(item);
          }/* else {
            item['showName'] = item.name;
          }*/
        });
        cePortList.push({
          uuid: 'br0',
          name: 'br0',
          showName: 'br0(LAN)',
          type: 'br0'
        });

        if (type === 'A') {
          this.cePortList_A = cePortList;

          this.ceList_B = [{name: '请选择', uuid: ''}];
          this.ceList.forEach((item) => {
            if (item.uuid !== ceUuid) {
              this.ceList_B.push(item);
            }
          });

          if (ceAChange) {
            this.updateHaForm.patchValue({cePortUuid_A: cePortList.length ? cePortList[0].name : ''});
            this.updateHaForm.patchValue({ceUuid_B: ''});
            this.cePortList_B = [];
            this.updateHaForm.patchValue({cePortUuid_B: ''});
            this.updateHaForm.patchValue({priority_B: ''});
          } else {
            if (this.selectedHa.haGroupCeRefs.length > 1) {
              this.getCePort(this.selectedHa.haGroupCeRefs[1].ceUuid, 'B', false);
            }
          }
        }
        if (type === 'B') {
          const portList = [];

          this.cePortList_A.forEach((item) => {
            if (item.name === this.cePortUuid_A.value) {
              for (let i = 0; i < cePortList.length; i++) {
                if (item.type === cePortList[i].type) {
                  portList.push(cePortList[i]);
                }
              }
              return;
            }
          });
          this.cePortList_B = portList;

          if (!this.isFirstSet || this.cePortUuid_B.value === '') {
            this.updateHaForm.patchValue({cePortUuid_B: this.cePortList_B.length ? this.cePortList_B[0].name : ''});
          }
          this.isFirstSet = false;
        }
      });
    }
  }

  getCePort_B() {
    this.tips.priorityTip = null;
    if (this.showCeB) {
      if (this.ceUuid_B.value === '') {
        this.cePortList_B = [];
        this.updateHaForm.patchValue({cePortList_B: ''});
        this.updateHaForm.patchValue({priority_B: ''});
      } else {
        this.getCePort(this.ceUuid_B.value, 'B', false);
      }
    }
  }

  add() {
    this.showCeB = true;
    this.updateHaForm.patchValue({ceUuid_B: ''});
    this.updateHaForm.patchValue({cePortUuid_B: ''});
    this.updateHaForm.patchValue({priority_B: ''});
  }

  minus() {
    this.showCeB = false;
    this.tips.priorityTip = null;
    this.updateHaForm.patchValue({ceUuid_B: ''});
    this.updateHaForm.patchValue({cePortUuid_B: ''});
    this.updateHaForm.patchValue({priority_B: ''});
  }

  clearTips() {
    this.tips.priorityTip = null;
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const ha = new HaInventory();
    ha.uuid = this.selectedHa.uuid;
    ha.name = this.name.value;
    ha.vrid = this.vrid.value;
    ha.vip = this.vip1.value + '.' + this.vip2.value + '.' + this.vip3.value + '.' + this.vip4.value + '/' + this.vip5.value;
    ha.sdwanNetworkUuid = this.selectedHa.sdwanNetworkUuid;
    ha.ceInfo = [];
    ha.ces = [];
    if (this.ceUuid_A.value !== '' && this.cePortUuid_A.value !== '') {
      if (this.priority_A.value === '') {
        this.tips.priorityTip = '请输入优先级';
        return;
      } else {
        ha.ces.push({
          ceUuid: this.ceUuid_A.value,
          nic: this.cePortUuid_A.value,
          priority: this.priority_A.value
        });
        this.ceList_A.forEach((item) => {
          if (item.uuid === this.ceUuid_A.value) {
            ha.ceInfo.push({
              name: item.name,
              uuid: item.uuid
            });
            return;
          }
        });
      }
    }
    if (this.showCeB && this.ceUuid_B.value !== '' && this.cePortUuid_B.value !== '') {
      if (this.priority_B.value === '') {
        this.tips.priorityTip = '请输入优先级';
        return;
      } else {
        ha.ces.push({
          ceUuid: this.ceUuid_B.value,
          nic: this.cePortUuid_B.value,
          priority: this.priority_B.value
        });
        this.ceList_B.forEach((item) => {
          if (item.uuid === this.ceUuid_B.value) {
            ha.ceInfo.push({
              name: item.name,
              uuid: item.uuid
            });
            return;
          }
        });
      }
    }

    if (parseInt(this.priority_A.value, 10) === parseInt(this.priority_B.value, 10)) {
      this.tips.priorityTip = '优先级不能相同';
      return;
    }

    this.done.emit(ha);
    this.dialogOptions.visible = false;
  }

}
