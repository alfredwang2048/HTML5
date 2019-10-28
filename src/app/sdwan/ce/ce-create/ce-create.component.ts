import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {CeInventory, CeModelService, SdwanInventory, SdwanService} from '../../../shared/sdwan';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CeService} from '../../../shared/sdwan/ce.service';
import {QueryObject} from '../../../base';
import {findCityByProvince, findProvivceByCountry, NodeMap} from '../../../model';
import {Observable} from 'rxjs/Observable';
import {ConnectionMode} from '../../../model/utils';

@Component({
  selector: 'app-ce-create',
  templateUrl: './ce-create.component.html',
  styleUrls: ['./ce-create.component.styl']
})
export class CeCreateComponent implements OnInit {
  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();
  createCeForm: FormGroup;
  models: Array<any> = null;
  connectionTypes;
  connectionModes: Array<any>;
  sdwanNetworks: Array<SdwanInventory> = [];
  countrys = NodeMap;
  provinces = null;
  citys = null;
  allBandwidth: Array<any>;
  selectedBandwith: any;
  bandwidthTips = false;
  l3Protocols = [{name: 'BGP', value: 'BGP'}, {name: 'NAT', value: 'NAT'}];
  currentModel;
  dialogOptions = {
    title: '新建CPE',
    width: '580px',
    visible: false,
    changeHeight: 0
  };
  UtilsconnectionMode = ConnectionMode;

  constructor(
    private fb: FormBuilder,
    private ceService: CeService,
    private sdwanService: SdwanService,
    private ceModelService: CeModelService
  ) {
  }

  ngOnInit() {
    this.createForm();
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.sdwanNetworks = null;
    this.connectionTypes = [{name: '专线连接', value: 'TUNNEL'}, {name: 'SD-WAN连接', value: 'SDWAN'}];
    this.resetForm();
    this.getAllBandwidth();

    const obs_model = new Observable(observer => {
      this.getModels((data) => {
        observer.next(data);
      });
    });

    const obs_mode = new Observable(observer => {
      this.listConnectionMode(this.model.value, (data) => {
        observer.next(data);
      });
    });

    const sub1 = obs_model.subscribe(value1 => {
      sub1.unsubscribe();
      const sub2 = obs_mode.subscribe(value2 => {
        sub2.unsubscribe();
      });
    });
  }

  getAllBandwidth() {
    const qobj = new QueryObject();
    qobj.sortBy = 'bandwidth';
    qobj.sortDirection = 'asc';
    qobj.conditions = [];
    const sub = this.ceService.queryBandwidth(qobj, (datas: any) => {
      sub.unsubscribe();
      this.allBandwidth = datas;
    });
  }

  listConnectionMode(model, done: (modes) => void) {
    const sub = this.ceService.listConnection(model, (datas) => {
      sub.unsubscribe();
      this.connectionModes = datas;
      if (datas.length) {
        this.createCeForm.patchValue({
          connectionMode: this.connectionModes[0]
        });
      }
      done(datas);
    });
  }

  getModels(done: (data) => void) {
    const qobj = new QueryObject();
    qobj.groupBy = 'model';
    qobj.conditions = [];
    qobj.fields = ['model', 'os'];
    const sub = this.ceModelService.query(qobj, (datas: any, total) => {
      sub.unsubscribe();
      if (total) {
        this.createCeForm.patchValue({
          model: datas[0].model
        });
        this.currentModel = datas[0];
        this.dealCurrentModel(this.currentModel);
      }
      this.models = datas;
      done(this.models);
    });
  }

  dealCurrentModel(currentModel) {
    // 限制非vyos的显示
    if (currentModel.os === 'vyos') {
      this.connectionTypes = [{name: '专线连接', value: 'TUNNEL'}, {name: 'SD-WAN连接', value: 'SDWAN'}];
    }else {
      this.connectionTypes = [{name: 'SD-WAN连接', value: 'SDWAN'}];
    }
  }

  changeModel() {
    setTimeout(() => {
      this.currentModel = this.models.filter(item => item.model === this.model.value)[0];
      this.dealCurrentModel(this.currentModel);
    });
    this.listConnectionMode(this.model.value, (datas) => {
    });
  }

  accountChange(account) {
    if (account && this.connectionType.value === 'SDWAN') {
      this.getSdwanNetwork(account);
    }else {
      this.sdwanNetworks = null;
      this.createCeForm.patchValue({sdwanNetworkUuid: ''});
    }
  }

  getSdwanNetwork(account) {
    this.sdwanNetworks = null;
    this.createCeForm.patchValue({sdwanNetworkUuid: ''});
    const qobj = new QueryObject();
    qobj.addCondition({name: 'accountUuid', op: '=', value: account.uuid});
    if (this.connectionMode.value !== 'DOUBLE_INTERNET') {
      qobj.addCondition({name: 'l3networkType', op: '=', value: 'ASSIGN'});
    }
    this.sdwanService.query(qobj, (datas, total) => {
      this.sdwanNetworks = datas;
      if (total) {
        this.createCeForm.patchValue({
          sdwanNetworkUuid: datas[0].uuid
        });
      }
    }, false);
  }

  changeConnectionType() {
    if (this.connectionType.value === 'TUNNEL') {
      this.sdwanNetworks = null;
      this.createCeForm.patchValue({sdwanNetworkUuid: ''});
      this.sdwanNetworkUuid.setValidators(null);
      this.sdwanNetworkUuid.updateValueAndValidity();
    }else {
      this.sdwanNetworkUuid.setValidators([Validators.required]);
      this.sdwanNetworkUuid.updateValueAndValidity();
      if (this.accountRef.value) {this.getSdwanNetwork(this.accountRef.value); }
    }
  }

  changeConnectionMode() {
    if (this.connectionType.value === 'SDWAN' && this.accountRef.value) {this.getSdwanNetwork(this.accountRef.value); }
  }

  createForm() {
    this.createCeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(6)]],
      accountRef: [null, Validators.required],
      model: ['', Validators.required],
      esn: ['', [Validators.required, Validators.pattern('^[a-z0-9]*$')]],
      l3Protocol: [''],
      connectionType: [''],
      connectionMode: ['', Validators.required],
      sdwanNetworkUuid: ['', Validators.required],
      applyTemplate: [false],
      country: [''],
      province: [''],
      city: [''],
      address: ['', Validators.required],
    });
  }

  selectBandwidthDone(e) {
    this.selectedBandwith = e;
    this.bandwidthTips = false;
  }

  changeArea() {
    this.provinces = findProvivceByCountry(this.country.value);
    this.createCeForm.patchValue({province: this.provinces[0].zh});
    this.citys = findCityByProvince(this.province.value);
    this.createCeForm.patchValue({city: this.provinces[0].zh});
  }

  changeProvince() {
    this.citys = findCityByProvince(this.province.value);
    this.createCeForm.patchValue({city: this.citys[0].zh});
  }

  get accountRef() {
    return this.createCeForm.get('accountRef');
  }

  get name() {
    return this.createCeForm.get('name');
  }

  get model() {
    return this.createCeForm.get('model');
  }

  get esn() {
    return this.createCeForm.get('esn');
  }

  get connectionType() {
    return this.createCeForm.get('connectionType');
  }

  get connectionMode() {
    return this.createCeForm.get('connectionMode');
  }

  get sdwanNetworkUuid() {
    return this.createCeForm.get('sdwanNetworkUuid');
  }

  get country() {
    return this.createCeForm.get('country');
  }

  get province() {
    return this.createCeForm.get('province');
  }

  get city() {
    return this.createCeForm.get('city');
  }

  get address() {
    return this.createCeForm.get('address');
  }

  get l3Protocol() {
    return this.createCeForm.get('l3Protocol');
  }

  get applyTemplate() {
    return this.createCeForm.get('applyTemplate');
  }

  resetForm() {
    this.createCeForm.reset({
      name: '',
      model: null,
      esn: '',
      connectionType: this.connectionTypes[1].value,
      connectionMode: '',
      l3Protocol: this.l3Protocols[0].value,
      sdwanNetworkUuid: '',
      applyTemplate: false,
      country: this.countrys[0].en,
      province: '',
      city: '',
      address: ''
    });

    this.provinces = findProvivceByCountry(this.country.value);
    this.createCeForm.patchValue({province: this.provinces[0].zh});
    this.citys = findCityByProvince(this.province.value);
    this.createCeForm.patchValue({city: this.citys[0].zh});
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const ce = new CeInventory();
    ce.accountUuid = this.accountRef.value.uuid;
    ce.name = this.name.value;
    ce.model = this.model.value;
    ce.esn = this.esn.value;
    ce.connectionType = this.connectionType.value;
    ce.connectionMode = this.connectionMode.value;

    if (this.connectionType.value === 'SDWAN') {
      ce.sdwanNetworkUuid = this.sdwanNetworkUuid.value;
      if (this.currentModel.os === 'vyos') {
        ce.applyTemplate = this.applyTemplate.value;
        ce.l3Protocol = this.l3Protocol.value;
      }else {
        ce.l3Protocol = null;
        ce.applyTemplate = null;
      }
    }else {
      ce.sdwanNetworkUuid = null;
      ce.l3Protocol = null;
      ce.applyTemplate = null;
    }
    ce.country = this.country.value;
    ce.province = this.province.value;
    ce.city = this.city.value;
    ce.address = this.address.value;

    if (this.connectionMode.value === 'TUNNEL_INTERNET' || this.connectionMode.value === 'DOUBLE_INTERNET') {
      if (!this.selectedBandwith) {
        this.bandwidthTips = true;
      }else {
        this.bandwidthTips = false;
        ce.bandwidthOfferingUuid = this.selectedBandwith.name;
      }
    }else {
      this.bandwidthTips = false;
      ce.bandwidthOfferingUuid = null;
    }
    if (!this.bandwidthTips) {
      this.done.emit(ce);
      this.dialogOptions.visible = false;
    }
  }

}
