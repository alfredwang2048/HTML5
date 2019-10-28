import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {InterfaceInventory, VpeService} from '../../../shared/sdwan';
import {QueryObject} from '../../../base';

@Component({
  selector: 'app-vpe-interface-create',
  templateUrl: './vpe-interface-create.component.html',
  styleUrls: ['./vpe-interface-create.component.styl']
})
export class VpeInterfaceCreateComponent implements OnInit {

  @Input()
  selectedItemVpe;
  @Input()
  interfaceLists;
  @Output()
  done: EventEmitter<null> = new EventEmitter();

  createModelForm: FormGroup;
  dialogOptions = {
    title: '新建接口',
    width: '380px',
    visible: false,
    changeHeight: 0
  };
  // numOnly;
  endpointLists: Array<any>;
  switchLists: Array<any>;
  switchPortLists: Array<any>;

  constructor(private fb: FormBuilder, private vpeService: VpeService) {
  }

  // get number() {
  //   return this.createModelForm.get('number');
  // }

  get endpointUuid() {
    return this.createModelForm.get('endpointUuid');
  }

  get switchUuid() {
    return this.createModelForm.get('switchUuid');
  }

  get switchPortUuid() {
    return this.createModelForm.get('switchPortUuid');
  }

  get interfaceName() {
    return this.createModelForm.get('interfaceName');
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.createModelForm = this.fb.group({
      // number: ['', [Validators.required, Validators.pattern(/^[0-9]*[1-9][0-9]*$/)]],
      endpointUuid: ['', Validators.required],
      switchUuid: ['', Validators.required],
      switchPortUuid: ['', Validators.required],
      interfaceName: ['', Validators.required]
    });
  }

  openDialog() {
    this.resetForm();
    this.queryEndpointLists();
    this.dialogOptions.visible = true;
  }

  resetForm() {
    // this.numOnly = false;
    this.createModelForm.reset({
      // number: '',
      endpointUuid: '',
      switchUuid: '',
      switchPortUuid: '',
      interfaceName: ''
    });
  }

  // checkNumOnly(num) {
  //   let flag = false;
  //   this.interfaceLists.forEach(item => {
  //     if (Number(num) === item.number) {
  //       flag = true
  //     }
  //   });
  //   return flag;
  // }

  queryEndpointLists() {
    const qobj = new QueryObject();
    qobj.fields = ['uuid', 'name'];
    qobj.addCondition({name: 'nodeUuid', op: '=', value: this.selectedItemVpe.nodeUuid});
    const sub = this.vpeService.queryEndpoint(qobj, (datas, total) => {
      sub.unsubscribe();
      this.endpointLists = datas;
      if (total > 0) {
        this.createModelForm.patchValue({
          endpointUuid: datas[0].uuid
        });
        this.changeEndpoint();
      } else {
        this.createModelForm.patchValue({
          endpointUuid: '',
          switchUuid: '',
          switchPortUuid: ''
        });
      }
    });
  }

  querySwitchLists(endpointUuid) {
    const qobj = new QueryObject();
    qobj.conditions = [{name: 'endpointUuid', op: '=', value: endpointUuid}];
    qobj.fields = ['uuid', 'name'];
    const sub = this.vpeService.querySwitch(qobj, (datas, total) => {
      sub.unsubscribe();
      this.switchLists = datas;
      if (total > 0) {
        this.createModelForm.patchValue({
          switchUuid: datas[0].uuid
        });
        this.changeSwitch();
      } else {
        this.createModelForm.patchValue({
          switchUuid: '',
          switchPortUuid: ''
        });
      }
    });
  }

  querySwitchPortLists(switchUuid) {
    const qobj = new QueryObject();
    qobj.conditions = [{name: 'switchUuid', op: '=', value: switchUuid}];
    qobj.fields = ['uuid', 'portName'];
    const sub = this.vpeService.querySwitchPort(qobj, (datas, total) => {
      sub.unsubscribe();
      this.switchPortLists = datas;
      this.createModelForm.patchValue({
        switchPortUuid: total ? datas[0].uuid : ''
      });
    });
  }

  changeEndpoint() {
    this.querySwitchLists(this.endpointUuid.value);
  }

  changeSwitch() {
    this.querySwitchPortLists(this.switchUuid.value);
  }

  confirm() {
    // let flag = this.checkNumOnly(this.number.value);
    // if (flag) {
    //   this.numOnly = flag;
    //   return;
    // }
    const model = new InterfaceInventory();
    model.vpeUuid = this.selectedItemVpe.uuid;
    model.endpointUuid = this.endpointUuid.value;
    model.switchUuid = this.switchUuid.value;
    model.switchPortUuid = this.switchPortUuid.value;
    model.interfaceName = this.interfaceName.value;

    this.vpeService.createVpeInterface(model, () => {
      this.done.emit();
    });
    this.dialogOptions.visible = false;
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

}
