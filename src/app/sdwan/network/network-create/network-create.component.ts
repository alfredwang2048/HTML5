import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SdwanInventory, SdwanService} from '../../../shared/sdwan';
import {QueryObject} from '../../../base/';
import {purposes} from '../../../model/utils';

@Component({
  selector: 'app-network-create',
  templateUrl: './network-create.component.html',
  styleUrls: ['./network-create.component.styl']
})
export class NetworkCreateComponent implements OnInit {
  createNetworkForm: FormGroup;
  dialogOptions = {
    title: '新建SD-WAN网络',
    width: '455px',
    visible: false,
    changeHeight: 0
  };

  @Output()
  done: EventEmitter<null> = new EventEmitter();

  public l3NetworkList;
  public purposes = purposes;
  public tips = {
    nameTip: null,
    secondAddressTip: null
  };
  selectedL3;
  manualInvalid = true;

  constructor(private fb: FormBuilder, private sdServer: SdwanService) {
  }

  get name() {
    return this.createNetworkForm.get('name');
  }

  get accountUuid() {
    return this.createNetworkForm.get('accountUuid');
  }

  get l3networkUuid() {
    return this.createNetworkForm.get('l3networkUuid');
  }

  get secondAddress() {
    return this.createNetworkForm.get('secondAddress');
  }

  get purpose() {
    return this.createNetworkForm.get('purpose');
  }

  get description() {
    return this.createNetworkForm.get('description');
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.createNetworkForm = this.fb.group({
      name: ['', Validators.required],
      accountUuid: [null, Validators.required],
      l3networkUuid: '',
      secondAddress: '',
      purpose: '',
      description: ''
    });
  }

  openDialog() {
    this.resetForm();
    this.dialogOptions.visible = true;
  }

  resetForm() {
    this.createNetworkForm.reset(
      {
        name: '',
        accountUuid: null,
        l3networkUuid: '',
        secondAddress: '0',
        purpose: this.purposes[0].name,
        description: ''
      }
    );
    this.tips.nameTip = null;
    this.tips.secondAddressTip = null;
    this.selectedL3 = 'auto';
    this.manualInvalid = true;
  }

  queryL3Network(uuid) {
    const qobj = new QueryObject();
    qobj.addCondition({name: 'accountUuid', op: '=', value: uuid});
    qobj.addCondition({name: 'purpose', op: '!=', value: 'SDWAN'});
    const sub = this.sdServer.queryL3Network(qobj, (s, total) => {
      sub.unsubscribe();
      this.l3NetworkList = s;
      this.createNetworkForm.patchValue({
        l3networkUuid: s.length > 0 ? s[0].uuid : ''
      });
      this.manualInvalid = s.length > 0 ? false : true;
    });
  }

  changeAccount(e) {
    this.createNetworkForm.patchValue({
      accountUuid: e ? e.uuid : null
    });
    if (e) {
      this.queryL3Network(e.uuid);
    } else {
      this.l3NetworkList = [];
      this.createNetworkForm.patchValue({
        l3networkUuid: ''
      });
    }
    this.selectedL3 = 'auto';
  }

  changeName(value) {
    if (value) {
      if (value.length < 6) {
        this.tips.nameTip = 'SD-WAN网络名称长度不能小于6个字符';
      } else {
        this.tips.nameTip = null;
      }
    } else {
      this.tips.nameTip = 'SD-WAN网络名称必填';
    }
  }

  changeSecondAddress(value) {
    const reg = new RegExp(/^([1-2]{1}[0-5]{1}[0-5]{1}|2{1}[0-4]{1}[0-9]{1}|1[0-9]{1}[0-9]{1}|[1-9]{1}[0-9]{1}|[0-9]{1})$/);
    if (reg.test(value)) {
      this.tips.secondAddressTip = null;
    } else {
      if (value) {
        this.tips.secondAddressTip = '输入错误';
      } else {
        this.tips.secondAddressTip = '不能为空';
      }
    }
  }

  selectType(item){
    this.selectedL3 = item;
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const sdwan = new SdwanInventory();
    sdwan.name = this.name.value;
    sdwan.accountUuid = this.accountUuid.value;
    sdwan.cidr = '10.' + this.secondAddress.value + '.0.0/16';
    sdwan.description = this.description.value;
    sdwan.purpose = this.purpose.value;
    if (this.l3networkUuid.value && this.selectedL3 === 'manual') {
      sdwan.l3networkUuid = this.l3networkUuid.value;
    }
    this.sdServer.create(sdwan, () => {
      this.done.emit();
    });
    this.dialogOptions.visible = false;
  }

}
