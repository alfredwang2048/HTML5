import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IpInfoInventory, VpeService} from '../../../shared/sdwan';
import {PublicNetworkType} from '../vpe.component';

@Component({
  selector: 'app-vpe-set-network-create',
  templateUrl: './vpe-set-network-create.component.html',
  styleUrls: ['./vpe-set-network-create.component.styl']
})
export class VpeSetNetworkCreateComponent implements OnInit {

  @Input()
  VPEUuid;
  @Input()
  networkLists;
  @Output()
  done: EventEmitter<null> = new EventEmitter();

  createModelForm: FormGroup;
  dialogOptions = {
    title: '添加公网线路',
    width: '380px',
    visible: false,
    changeHeight: 0
  };
  publicNetworkType = PublicNetworkType;

  // numOnly;

  constructor(private fb: FormBuilder, private vpeService: VpeService) {
  }

  // get number() {
  //   return this.createModelForm.get('number');
  // }

  get type() {
    return this.createModelForm.get('type');
  }

  get publicIp() {
    return this.createModelForm.get('publicIp');
  }

  get bandwidth() {
    return this.createModelForm.get('bandwidth');
  }

  get interfaceName() {
    return this.createModelForm.get('interfaceName');
  }

  get netmask() {
    return this.createModelForm.get('netmask');
  }

  get gateway() {
    return this.createModelForm.get('gateway');
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.createModelForm = this.fb.group({
      // number: [null, [Validators.required, Validators.pattern(/^[0-9]*[1-9][0-9]*$/)]],
      type: ['', Validators.required],
      publicIp: ['', Validators.required],
      bandwidth: ['', Validators.required],
      interfaceName: ['', Validators.required],
      netmask: ['', Validators.required],
      gateway: ['', Validators.required]
    });
  }

  openDialog() {
    this.resetForm();
    this.dialogOptions.visible = true;
  }

  resetForm() {
    // this.numOnly = false;
    this.createModelForm.reset({
      // number: null,
      type: this.publicNetworkType[0].value,
      publicIp: '',
      bandwidth: '',
      interfaceName: '',
      netmask: '',
      gateway: ''
    });
  }

  // checkNumOnly(num) {
  //   let flag = false;
  //   this.networkLists.forEach(item => {
  //     if (Number(num) == item.number) {
  //       flag = true;
  //     }
  //   });
  //   return flag;
  // }

  confirm() {
    // let flag = this.checkNumOnly(this.number.value);
    // if (flag) {
    //   this.numOnly = flag;
    //   return;
    // }
    const model = new IpInfoInventory();
    model.vpeUuid = this.VPEUuid;
    // model.number = Number(this.number.value);
    model.type = this.type.value;
    model.publicIp = this.publicIp.value;
    model.bandwidth = this.bandwidth.value * 1024 * 1024;
    model.interfaceName = this.interfaceName.value;
    model.netmask = this.netmask.value;
    model.gateway = this.gateway.value;

    this.vpeService.createVpeIpInfo(model, () => {
      this.done.emit();
    });
    this.dialogOptions.visible = false;
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

}
