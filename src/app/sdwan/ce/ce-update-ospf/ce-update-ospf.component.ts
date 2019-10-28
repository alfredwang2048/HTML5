import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CeInventory} from '../../../shared/sdwan';
import {CeService} from '../../../shared/sdwan/ce.service';

@Component({
  selector: 'app-ce-update-ospf',
  templateUrl: './ce-update-ospf.component.html',
  styleUrls: ['./ce-update-ospf.component.styl']
})
export class CeUpdateOspfComponent implements OnInit {

  @Input()
  ospfInfo: any;
  @Input()
  ceUuid: string;
  @Output()
  done: EventEmitter<any>  = new EventEmitter<any>();

  updateOspfForm: FormGroup;
  dialogOptions = {
    title: 'OSPF路由配置',
    width: '470px',
    visible: false,
    changeHeight: 0
  };
  states = [{name: '启用', value: 'Enabled'}, {name: '禁用', value: 'Disabled'}];
  portsLists = [];
  initState = 'Disabled';

  constructor(private fb: FormBuilder,
              private ceService: CeService) {
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.initState = this.ospfInfo.length>0?'Enabled':'Disabled';

    this.changeState(true);
    this.getOspfPort();
  }
  ngOnInit() {
    this.createForm();
  }

  resetForm(init?: Boolean) {
    this.updateOspfForm.reset({
      state: this.state.value,
      area: '0',
      metrics: '16',
      helloInterval: '10',
      deadInterval: '40',
      interfaceName: '',
    });

    if(!init){
      this.updateOspfForm.patchValue({
        interfaceName: this.portsLists[0].dev
      });
    }
    if(init && this.initState==='Enabled'){
      this.updateOspfForm.reset({
        state: this.initState,
        area: this.ospfInfo[0].area,
        metrics: this.ospfInfo[0].metrics,
        helloInterval: this.ospfInfo[0].helloInterval,
        deadInterval: this.ospfInfo[0].deadInterval,
        interfaceName: this.ospfInfo[0].interfaceName,
      });
    }
    if(init && this.initState ==='Disabled'){
      this.updateOspfForm.patchValue({
        state: 'Disabled'
      });
    }
  }
  createForm() {
    this.updateOspfForm = this.fb.group({
      state: 'Disabled',
      area: ['0', [Validators.required, Validators.min(0), Validators.max(4294967295)]],
      metrics: ['16', [Validators.required, Validators.min(1), Validators.max(16)]],
      helloInterval: ['10', [Validators.required, Validators.min(1), Validators.max(65535)]],
      deadInterval: ['40', [Validators.required, Validators.min(1), Validators.max(65535)]],
      interfaceName: ['', [Validators.required]],


    });
  }
  get state() { return this.updateOspfForm.get('state'); }
  get area() { return this.updateOspfForm.get('area'); }
  get metrics() { return this.updateOspfForm.get('metrics'); }
  get helloInterval() { return this.updateOspfForm.get('helloInterval'); }
  get deadInterval() { return this.updateOspfForm.get('deadInterval'); }
  get interfaceName() { return this.updateOspfForm.get('interfaceName'); }

  changeState(init?: Boolean) {
    this.resetForm(init);
    if((init && this.initState==='Enabled') || this.state.value==='Enabled'){
      this.area.setValidators([Validators.required, Validators.min(0), Validators.max(4294967295)]);
      this.metrics.setValidators([Validators.required, Validators.min(1), Validators.max(16)]);
      this.helloInterval.setValidators([Validators.required, Validators.min(1), Validators.max(65535)]);
      this.deadInterval.setValidators([Validators.required, Validators.min(1), Validators.max(65535)]);
      this.interfaceName.setValidators([Validators.required]);
    }else {
      this.area.setValidators(null);
      this.metrics.setValidators(null);
      this.helloInterval.setValidators(null);
      this.deadInterval.setValidators(null);
      this.interfaceName.setValidators(null);
    }
    this.area.updateValueAndValidity();
    this.metrics.updateValueAndValidity();
    this.helloInterval.updateValueAndValidity();
    this.deadInterval.updateValueAndValidity();
    this.interfaceName.updateValueAndValidity();
  }

  getOspfPort() {
    this.ceService.getOspfPort(this.ceUuid, datas => {
      this.portsLists = datas;
      if (datas.length>0) {
        if (this.initState === 'Enabled') {
          this.updateOspfForm.patchValue({
            interfaceName: this.ospfInfo[0].interfaceName
          });
        } else {
          this.updateOspfForm.patchValue({
            interfaceName: datas[0].dev
          });
        }
      }
    });
  }

  cancel() {
    this.initState = 'Disabled';
    this.dialogOptions.visible = false;
  }

  confirm() {
    let infoPage:any = {
      state: this.state.value,
      ceUuid: this.ceUuid,
    };
    if(this.state.value === 'Enabled'){
      infoPage.area = this.area.value;
      infoPage.metrics = this.metrics.value;
      infoPage.helloInterval = this.helloInterval.value;
      infoPage.deadInterval = this.deadInterval.value;
      infoPage.interfaceName = this.interfaceName.value;
    }else {
      infoPage.uuid = this.ospfInfo[0].uuid;
    }

    this.done.emit(infoPage);
    this.initState = 'Disabled';
    this.dialogOptions.visible = false;
  }

}
