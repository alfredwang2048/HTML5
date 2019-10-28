import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeInventory, QosInventory} from '../../../shared/sdwan';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {COMMON_PATTERN, RandomUuid} from '../../../model/utils';
import {el} from '@angular/platform-browser/testing/src/browser_util';

@Component({
  selector: 'app-qos-create',
  templateUrl: './qos-create.component.html',
  styleUrls: ['./qos-create.component.styl']
})
export class QosCreateComponent implements OnInit {

  @Input()
    selectedItem: any;
  @Input()
    totalNum: number;
  @Input()
    currentNum: number;
  @Input()
    isModel = false;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();
  dialogOptions = {
    title: '添加QoS规则',
    width: '600px',
    visible: false,
    changeHeight: 0
  };
  createQosForm: FormGroup;
  types = [{text: 'IP', value: 'ip'}, {text: '端口', value: 'port'}, {text: 'IP+端口', value: 'ipPort'}];
  protocols = [{text: 'all', value: 'all'}, {text: 'tcp', value: 'tcp'}, {text: 'udp', value: 'udp'}, {text: 'icmp', value: 'icmp'}];
  qosTypes = [{name: 'WAN_OUT', value: 'wan'}, {name: 'POP_OUT', value: 'pop'}];
  levels = [{name: '金', value: 'GOLD'}, {name: '银', value: 'SILVER'}, {name: '铜', value: 'COPPER'}];
  isShowTips = false;
  isSameIP = false;
  isTouched = true;
  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.createQosForm = this.fb.group({
      source: ['', Validators.required],
      destination: ['', Validators.required],
      srcIP: [''],
      destIP: [''],
      srcPort: [''],
      destPort: [''],
      protocol: ['', Validators.required],
      type: ['', Validators.required],
      level: ['', Validators.required],
    });
  }

  resetForm() {
    this.createForm();
    this.createQosForm.reset({
      source: this.types[0].value,
      destination: this.types[0].value,
      srcIP: '',
      destIP: '',
      srcPort: '',
      destPort: '',
      protocol: this.protocols[0].value,
      type: this.qosTypes[0].value,
      level: this.levels[0].value,
    });
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.protocols = [{text: 'all', value: 'all'}, {text: 'tcp', value: 'tcp'}, {text: 'udp', value: 'udp'}, {text: 'icmp', value: 'icmp'}];
    this.resetForm();
    this.isShowTips = false;
    this.isSameIP = false;
    this.isTouched = true;

    this.srcIP.valueChanges.subscribe((value) => {
      this.validatorRequired();
    });
    this.srcPort.valueChanges.subscribe((value) => {
      this.validatorRequired();
    });
    this.destIP.valueChanges.subscribe((value) => {
      this.validatorRequired();
    });
    this.destPort.valueChanges.subscribe((value) => {
      this.validatorRequired();
    });

  }

  validatorRequired() {
    this.isTouched = false;
    if (!this.srcIP.value.trim() && !this.srcPort.value.trim() && !this.destIP.value.trim() && !this.destPort.value.trim()) {
      this.isShowTips = true;
    }else {
      this.isShowTips = false;
    }
    if (!!this.srcIP.value.trim() && !!this.destIP.value.trim() && this.srcIP.value === this.destIP.value) {
      this.isSameIP = true;
    }else {
      this.isSameIP = false;
    }
  }

  changeSource() {
    this.srcIP.patchValue('');
    this.srcPort.patchValue('');
    if (this.source.value !== 'ip') {
      this.srcPort.setValidators([Validators.pattern(COMMON_PATTERN.port)]);
      this.srcPort.updateValueAndValidity();
    }
    this.filterProtocol();
  }

  changeDestination() {
    this.destIP.patchValue('');
    this.destPort.patchValue('');
    if (this.destination.value !== 'ip') {
      this.destPort.setValidators([Validators.pattern(COMMON_PATTERN.port)]);
      this.destPort.updateValueAndValidity();
    }
    this.filterProtocol();
  }

  filterProtocol() {
    if (!(this.source.value === 'ip' && this.destination.value === 'ip')) {
      this.protocols = [{text: 'tcp', value: 'tcp'}, {text: 'udp', value: 'udp'}];
    }else {
      this.protocols = [{text: 'all', value: 'all'}, {text: 'tcp', value: 'tcp'}, {text: 'udp', value: 'udp'}, {text: 'icmp', value: 'icmp'}];
    }
    this.protocol.patchValue(this.protocols[0].value);
  }

  get source() {
    return this.createQosForm.get('source');
  }

  get destination() {
    return this.createQosForm.get('destination');
  }

  get srcIP() {
    return this.createQosForm.get('srcIP');
  }

  get destIP() {
    return this.createQosForm.get('destIP');
  }

  get srcPort() {
    return this.createQosForm.get('srcPort');
  }

  get destPort() {
    return this.createQosForm.get('destPort');
  }

  get type() {
    return this.createQosForm.get('type');
  }

  get protocol() {
    return this.createQosForm.get('protocol');
  }

  get level() {
    return this.createQosForm.get('level');
  }

  close() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const qos = new QosInventory();
    qos.uuid = RandomUuid();
    if (this.isModel) {
      qos.sdwanNetworkUuid = this.selectedItem.uuid;
    }else {
      qos.ceUuid = this.selectedItem.uuid;
    }
    if (this.srcIP.value) {
      qos.srcIp = this.srcIP.value;
    }
    if (this.srcPort.value) {
      qos.srcPort = parseFloat(this.srcPort.value);
    }
    if (this.destIP.value) {
      qos.destIp = this.destIP.value;
    }
    if (this.destPort.value) {
      qos.destPort = parseFloat(this.destPort.value);
    }
    qos.protocol = this.protocol.value;
    qos.type = this.type.value;
    qos.level = this.level.value;
    this.dialogOptions.visible = false;
    this.done.emit(qos);
  }
}
