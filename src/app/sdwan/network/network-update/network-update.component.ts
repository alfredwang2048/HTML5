import {Component, EventEmitter, OnInit, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SdwanInventory, SdwanService} from '../../../shared/sdwan';
import {purposes} from '../../../model/utils';

@Component({
  selector: 'app-network-update',
  templateUrl: './network-update.component.html',
  styleUrls: ['./network-update.component.styl']
})
export class NetworkUpdateComponent implements OnInit {

  updateNetworkForm: FormGroup;
  dialogOptions = {
    title: '修改SD-WAN网络',
    width: '450px',
    visible: false
  };

  public purposes = purposes;
  public tips = {
    nameTip: null
  };

  @Input()
  selectedNetwork: SdwanInventory;
  @Output()
  done: EventEmitter<SdwanInventory> = new EventEmitter();

  constructor(private fb: FormBuilder, private sdServer: SdwanService) {
  }

  get name() {
    return this.updateNetworkForm.get('name');
  }

  get purpose() {
    return this.updateNetworkForm.get('purpose');
  }

  get description() {
    return this.updateNetworkForm.get('description');
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.updateNetworkForm = this.fb.group({
      name: ['', Validators.required],
      purpose: '',
      description: ''
    });
  }

  open() {
    this.reset();
    this.dialogOptions.visible = true;
  }

  reset() {
    this.updateNetworkForm.setValue({
      name: this.selectedNetwork.name,
      purpose: this.selectedNetwork.purpose,
      description: this.selectedNetwork.description
    });
    this.tips.nameTip = null;
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

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const sdwan = new SdwanInventory();
    sdwan.uuid = this.selectedNetwork.uuid;
    sdwan.name = this.name.value;
    sdwan.purpose = this.purpose.value;
    sdwan.description = this.description.value;
    this.sdServer.update(sdwan, () => {
      this.done.emit();
    });
    this.dialogOptions.visible = false;
  }

}
