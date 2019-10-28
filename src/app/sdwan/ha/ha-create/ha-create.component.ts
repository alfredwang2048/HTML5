import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SdwanService, HaService, HaInventory} from '../../../shared/sdwan';
import {CeService} from '../../../shared/sdwan/ce.service';
import {QueryObject} from '../../../base';
import {el} from "@angular/platform-browser/testing/src/browser_util";

@Component({
  selector: 'app-ha-create',
  templateUrl: './ha-create.component.html',
  styleUrls: ['./ha-create.component.styl']
})
export class HaCreateComponent implements OnInit {
  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();

  createHaForm: FormGroup;
  dialogOptions = {
    title: '新建高可用HA组',
    width: '540px',
    visible: false,
    changeHeight: 0
  };

  sdwanNetworkList = [];
  ceList = [];
  ceList_A = [];
  ceList_B = [];
  cePortList_A = [];
  cePortList_B = [];
  tips = {
    priorityTip: null,
    sdwanNetworkTip: null,
    priority_B: false
  };

  constructor(private fb: FormBuilder,
              private sdwanServer: SdwanService,
              private ceService: CeService,
              private haService: HaService) {
  }

  get accountRef() {
    return this.createHaForm.get('accountRef');
  }

  get name() {
    return this.createHaForm.get('name');
  }

  get vrid() {
    return this.createHaForm.get('vrid');
  }

  get vip1() {
    return this.createHaForm.get('vip1');
  }

  get vip2() {
    return this.createHaForm.get('vip2');
  }

  get vip3() {
    return this.createHaForm.get('vip3');
  }

  get vip4() {
    return this.createHaForm.get('vip4');
  }

  get vip5() {
    return this.createHaForm.get('vip5');
  }

  get sdwanNetworkUuid() {
    return this.createHaForm.get('sdwanNetworkUuid');
  }

  get ceUuid_A() {
    return this.createHaForm.get('ceUuid_A');
  }

  get ceUuid_B() {
    return this.createHaForm.get('ceUuid_B');
  }

  get cePortUuid_A() {
    return this.createHaForm.get('cePortUuid_A');
  }

  get cePortUuid_B() {
    return this.createHaForm.get('cePortUuid_B');
  }

  get priority_A() {
    return this.createHaForm.get('priority_A');
  }

  get priority_B() {
    return this.createHaForm.get('priority_B');
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.createHaForm = this.fb.group({
      accountRef: [null, Validators.required],
      name: ['', [Validators.required, Validators.minLength(6)]],
      vrid: ['', [Validators.required, Validators.max(255), Validators.pattern('^\\d+$')]],
      vip1: ['', [Validators.required, Validators.max(255), Validators.pattern('^[1-9]+\\d*$')]],
      vip2: ['', [Validators.required, Validators.max(255), Validators.pattern('^([1-9]\\d*|[0]{1,1})$')]],
      vip3: ['', [Validators.required, Validators.max(255), Validators.pattern('^([1-9]\\d*|[0]{1,1})$')]],
      vip4: ['', [Validators.required, Validators.max(255), Validators.pattern('^([1-9]\\d*|[0]{1,1})$')]],
      vip5: ['', [Validators.required, Validators.max(255), Validators.pattern('^([1-9]\\d*|[0]{1,1})$')]],
      sdwanNetworkUuid: ['', [Validators.required]],
      ceUuid_A: ['', [Validators.required]],
      cePortUuid_A: ['', [Validators.required]],
      priority_A: ['', [Validators.required, Validators.min(2), Validators.max(254), Validators.pattern('^\\d*')]],
      ceUuid_B: [''],
      cePortUuid_B: [''],
      priority_B: ['', [Validators.min(2), Validators.max(254), Validators.pattern('^\\d*')]]
    });
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.resetForm();
  }

  resetForm() {
    this.createHaForm.reset({
      name: '',
      vrid: '',
      vip1: '',
      vip2: '',
      vip3: '',
      vip4: '',
      vip5: '',
      sdwanNetworkUuid: '',
      ceUuid_A: '',
      ceUuid_B: '',
      cePortUuid_A: '',
      cePortUuid_B: '',
      priority_A: '',
      priority_B: ''
    });
    this.sdwanNetworkList = [];
    this.ceList = [];
    this.ceList_A = [];
    this.ceList_B = [];
    this.cePortList_A = [];
    this.cePortList_B = [];
    this.tips = {
      priorityTip: null,
      sdwanNetworkTip: null,
      priority_B: false
    };
  }

  accountChange(account) {
    this.sdwanNetworkList = [];
    this.ceList_A = [];
    this.ceList_B = [];
    this.cePortList_A = [];
    this.cePortList_B = [];
    this.createHaForm.patchValue({sdwanNetworkUuid: ''});
    this.createHaForm.patchValue({ceUuid_A: ''});
    this.createHaForm.patchValue({ceUuid_B: ''});
    this.createHaForm.patchValue({cePortUuid_A: ''});
    this.createHaForm.patchValue({cePortUuid_B: ''});
    this.createHaForm.patchValue({priority_A: ''});
    this.createHaForm.patchValue({priority_B: ''});
    this.tips.sdwanNetworkTip = null;
    if (account) {
      const qobj = new QueryObject();
      qobj.addCondition({name: 'accountUuid', op: '=', value: account.uuid});
      this.sdwanServer.query(qobj, (sdwan, total) => {
        if (total) {
          this.sdwanNetworkList = sdwan;
          this.getCe(sdwan[0].uuid);
          this.createHaForm.patchValue({sdwanNetworkUuid: sdwan[0].uuid});
        } else {
          this.createHaForm.patchValue({sdwanNetworkUuid: ''});
          this.tips.sdwanNetworkTip = '该账户下没有可用的SDWAN网络';
        }
      }, false);
    }
  }

  getCe(sdwanUuid) {
    this.ceList = [];
    this.ceList_A = [];
    this.ceList_B = [];
    this.cePortList_A = [];
    this.cePortList_B = [];
    this.createHaForm.patchValue({ceUuid_A: ''});
    this.createHaForm.patchValue({ceUuid_B: ''});
    this.createHaForm.patchValue({cePortList_A: ''});
    this.createHaForm.patchValue({cePortList_B: ''});
    this.createHaForm.patchValue({priority_A: ''});
    this.createHaForm.patchValue({priority_B: ''});
    const qobj = new QueryObject();
    qobj.addCondition({name: 'sdwanNetworkUuid', op: '=', value: sdwanUuid});
    this.haService.queryCe(qobj, (ce, total) => {
      this.ceList = ce;
      this.ceList_A = ce;
      if (total) {
        this.getCePort(ce[0].uuid, 'A');
        this.createHaForm.patchValue({ceUuid_A: ce[0].uuid});
      }
    });
  }

  getCePort(ceUuid, type) {
    this.ceService.getDetail(ceUuid, (detail) => {
      const cePortList = [];
      // detail.lanPortInventories.forEach((item) => {
      //   cePortList.push(item);
      // });
      detail.wanPortInventories.forEach((item) => {
        if (item.ipCidr && item.ipCidr !== '') {
          item['showName'] = item.name + ' (ipCidr:' + item.ipCidr + ')';
          cePortList.push(item);
        }
        /*else {
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
        this.createHaForm.patchValue({cePortUuid_A: cePortList.length ? cePortList[0].uuid : ''});

        this.ceList_B = [{name: '请选择', uuid: ''}];
        this.ceList.forEach((item) => {
          if (item.uuid !== ceUuid) {
            this.ceList_B.push(item);
          }
        });
        this.createHaForm.patchValue({ceUuid_B: ''});
        this.cePortList_B = [];
        this.createHaForm.patchValue({cePortUuid_B: ''});
        this.createHaForm.patchValue({priority_B: ''});
      }
      if (type === 'B') {
        const portList = [];
        this.cePortList_A.forEach((item) => {
          if (item.uuid === this.cePortUuid_A.value) {
            for (let i = 0; i < cePortList.length; i++) {
              if (item.type === cePortList[i].type) {
                portList.push(cePortList[i]);
              }
            }
            return;
          }
        });
        this.cePortList_B = portList;
        this.createHaForm.patchValue({cePortUuid_B: this.cePortList_B.length ? this.cePortList_B[0].uuid : ''});
      }
    });
  }

  getCePort_B() {
    if (this.ceUuid_B.value === '') {
      this.cePortList_B = [];
      this.createHaForm.patchValue({cePortList_B: ''});
      this.createHaForm.patchValue({priority_B: ''});
    } else {
      this.getCePort(this.ceUuid_B.value, 'B');
    }
  }

  clearTips() {
    this.tips.priorityTip = null;
    this.tips.priority_B = false;
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const ha = new HaInventory();
    let nicA = '', nicB = '';
    this.cePortList_A.forEach((item) => {
      if (item.uuid === this.cePortUuid_A.value) {
        nicA = item.name;
      }
    });
    this.cePortList_B.forEach((item) => {
      if (item.uuid === this.cePortUuid_B.value) {
        nicB = item.name;
      }
    });

    ha.accountUuid = this.accountRef.value.uuid;
    ha.name = this.name.value;
    ha.vrid = this.vrid.value;
    ha.vip = this.vip1.value + '.' + this.vip2.value + '.' + this.vip3.value + '.' + this.vip4.value + '/' + this.vip5.value;
    ha.sdwanNetworkUuid = this.sdwanNetworkUuid.value;
    ha.ces = [{
      ceUuid: this.ceUuid_A.value,
      nic: nicA,
      priority: this.priority_A.value
    }];
    if (this.ceUuid_B.value !== '' && this.cePortUuid_B.value !== '' && this.priority_B.value !== '') {
      ha.ces.push({
        ceUuid: this.ceUuid_B.value,
        nic: nicB,
        priority: this.priority_B.value
      });
    }

    if (this.ceUuid_B.value !== '' && this.cePortUuid_B.value !== '' && this.priority_B.value === '') {
      this.tips.priority_B = true;
      return;
    }

    if (this.priority_A.value === this.priority_B.value) {
      this.tips.priorityTip = '优先级不能相同';
      return;
    }

    this.done.emit(ha);
    this.dialogOptions.visible = false;
  }

}
