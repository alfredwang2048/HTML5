import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeInventory, FirewallInventory} from '../../../shared/sdwan';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {COMMON_PATTERN, RandomUuid} from '../../../model/utils';
import {el} from '@angular/platform-browser/testing/src/browser_util';

@Component({
  selector: 'app-firewall-create',
  templateUrl: './firewall-create.component.html',
  styleUrls: ['./firewall-create.component.styl']
})
export class FirewallCreateComponent implements OnInit {

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
    title: '添加防火墙配置',
    width: '600px',
    visible: false,
    changeHeight: 0
  };
  createFireWallForm: FormGroup;
  types = [{text: 'IP', value: 'ip'}, {text: '端口', value: 'port'}, {text: 'IP+端口', value: 'ipPort'}];
  protocols = [{text: 'all', value: 'all'}, {text: 'tcp', value: 'tcp'}, {text: 'udp', value: 'udp'}, {text: 'icmp', value: 'icmp'}];
  directions = [{text: 'WAN_IN', value: 'WAN_IN'}, {text: 'WAN_OUT', value: 'WAN_OUT'}, {text: 'POP_IN', value: 'POP_IN'}, {text: 'POP_OUT', value: 'POP_OUT'}];
  actions = [{text: 'accept', value: 'accept'}, {text: 'drop', value: 'drop'}];
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
    this.createFireWallForm = this.fb.group({
      source: ['', Validators.required],
      destination: ['', Validators.required],
      srcIP: [''],
      destIP: [''],
      srcPort: [''],
      destPort: [''],
      protocol: ['', Validators.required],
      direction: ['', Validators.required],
      action: ['', Validators.required],
    });
  }

  resetForm() {
    this.createForm();
    this.createFireWallForm.reset({
      source: this.types[0].value,
      destination: this.types[0].value,
      srcIP: '',
      destIP: '',
      srcPort: '',
      destPort: '',
      protocol: this.protocols[0].value,
      direction: this.directions[0].value,
      action: this.actions[0].value,
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
    return this.createFireWallForm.get('source');
  }

  get destination() {
    return this.createFireWallForm.get('destination');
  }

  get srcIP() {
    return this.createFireWallForm.get('srcIP');
  }

  get destIP() {
    return this.createFireWallForm.get('destIP');
  }

  get srcPort() {
    return this.createFireWallForm.get('srcPort');
  }

  get destPort() {
    return this.createFireWallForm.get('destPort');
  }

  get direction() {
    return this.createFireWallForm.get('direction');
  }

  get protocol() {
    return this.createFireWallForm.get('protocol');
  }

  get action() {
    return this.createFireWallForm.get('action');
  }

  close() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const firewall = new FirewallInventory();
    firewall.uuid = RandomUuid();
    if (this.isModel) {
      firewall.sdwanNetworkUuid = this.selectedItem.uuid;
    }else {
      firewall.ceUuid = this.selectedItem.uuid;
    }
    if (this.srcIP.value) {
      firewall.srcIP = this.srcIP.value;
    }
    if (this.srcPort.value) {
      firewall.srcPort = parseFloat(this.srcPort.value);
    }
    if (this.destIP.value) {
      firewall.destIP = this.destIP.value;
    }
    if (this.destPort.value) {
      firewall.destPort = parseFloat(this.destPort.value);
    }
    firewall.protocol = this.protocol.value;
    firewall.direction = this.direction.value;
    firewall.action = this.action.value;
    this.dialogOptions.visible = false;
    this.done.emit(firewall);
  }
}
