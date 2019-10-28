import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {VpeInventory, VpeService} from '../../../shared/sdwan';

@Component({
  selector: 'app-vpe-update',
  templateUrl: './vpe-update.component.html',
  styleUrls: ['./vpe-update.component.styl']
})
export class VpeUpdateComponent implements OnInit {

  updateVpeForm: FormGroup;
  dialogOptions = {
    title: '修改VPE',
    width: '440px',
    visible: false,
  };
  @Input()
  selectedItem: VpeInventory;
  @Output()
  done: EventEmitter<VpeInventory> = new EventEmitter();

  constructor(private fb: FormBuilder,
              private vpeService: VpeService) {
  }

  get name() {
    return this.updateVpeForm.get('name');
  }

  get address() {
    return this.updateVpeForm.get('address');
  }

  get manageIp() {
    return this.updateVpeForm.get('manageIp');
  }

  get sshPort() {
    return this.updateVpeForm.get('sshPort');
  }

  get username() {
    return this.updateVpeForm.get('username');
  }

  get password() {
    return this.updateVpeForm.get('password');
  }

  ngOnInit() {
    this.createForm();
  }

  open() {
    this.resetForm();
    this.dialogOptions.visible = true;
  }

  resetForm() {
    this.updateVpeForm.patchValue({
      name: this.selectedItem.name,
      address: this.selectedItem.address,
      manageIp: this.selectedItem.manageIp,
      sshPort: this.selectedItem.sshPort ? this.selectedItem.sshPort : '22',
      username: this.selectedItem.username,
      password: null,
    });
  }

  createForm() {
    this.updateVpeForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      manageIp: ['', Validators.required],
      sshPort: '22',
      username: ['', Validators.required],
      password: null,
    });
  }

  confirm() {
    const model = new VpeInventory();
    model.uuid = this.selectedItem.uuid;
    model.name = this.name.value;
    model.address = this.address.value;
    model.manageIp = this.manageIp.value;
    model.sshPort = this.sshPort.value;
    model.username = this.username.value;
    model.password = this.password.value;
    this.vpeService.update(model, () => {
      this.done.emit();
    });
    this.dialogOptions.visible = false;
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

}
