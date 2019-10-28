import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CeService} from '../../../shared/sdwan/ce.service';

@Component({
  selector: 'app-ce-update-wan',
  templateUrl: './ce-update-wan.component.html',
  styleUrls: ['./ce-update-wan.component.styl']
})
export class CeUpdateWanComponent implements OnInit, OnChanges {

  selectedPort: any;
  @Output()
  done: EventEmitter<null> = new EventEmitter();
  updateCeWanForm: FormGroup;
  isOpenPortList = [{name: '启用', value: 'Enabled'}, {name: '禁用', value: 'Disabled'}];
  protocols = [{name: 'DHCP', value: 'DHCP'}, {name: '静态', value: 'STATIC'}];
  isShowTips = false;
  dialogOptions = {
    title: '修改',
    width: '430px',
    visible: false,
    changeHeight: 0
  };

  constructor(
    private fb: FormBuilder,
    private ceService: CeService
  ) { }

  openDialog(data) {
    this.dialogOptions.visible = true;
    this.isShowTips = false;
    this.selectedPort = data;
    if (this.selectedPort && this.updateCeWanForm) {
      this.updateCeWanForm.get('isOpenPort').patchValue(this.selectedPort.state);
      this.updateCeWanForm.get('protocol').patchValue(this.selectedPort.protocol);
      this.updateCeWanForm.get('ipCidr').patchValue(this.selectedPort.ipCidr);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedPort && this.updateCeWanForm) {
      this.updateCeWanForm.get('isOpenPort').patchValue(this.selectedPort.state);
      this.updateCeWanForm.get('protocol').patchValue(this.selectedPort.protocol);
      this.updateCeWanForm.get('ipCidr').patchValue(this.selectedPort.ipCidr);
    }
  }

  ngOnInit() {
    this.resetForm();
  }

  resetForm() {
    this.updateCeWanForm = this.fb.group({
      isOpenPort: [''],
      protocol: ['', Validators.required],
      ipCidr: [''],
    });
  }

  get isOpenPort() {
    return this.updateCeWanForm.get('isOpenPort');
  }

  get protocol() {
    return this.updateCeWanForm.get('protocol');
  }

  get ipCidr() {
    return this.updateCeWanForm.get('ipCidr');
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const infoPage = {
      name: this.selectedPort.name,
      uuid: this.selectedPort.uuid,
      protocol: this.protocol.value,
      ipCidr: this.ipCidr.value
    };
    if (this.isOpenPort.value === 'Enabled') {
      if (this.protocol.value === 'STATIC' && !this.ipCidr.value) {
        this.isShowTips = true;
      }else {
        this.ceService.enableWanPort(infoPage, (data) => {
          this.done.emit(data);
        });
        this.dialogOptions.visible = false;
      }
    }else {
      this.ceService.disablePort(infoPage, (data) => {
        this.done.emit(data);
      });
      this.dialogOptions.visible = false;
    }
  }
}
