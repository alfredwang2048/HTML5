import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {findCityByProvince, findProvivceByCountry, NodeMap} from '../../../model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CeInventory, CeModelService, SdwanInventory, SdwanService, StockInventory} from '../../../shared/sdwan';
import {CeService} from '../../../shared/sdwan/ce.service';
import {QueryObject} from '../../../base';
import {ConnectionMode} from '../../../model/utils';

@Component({
  selector: 'app-stock-attach',
  templateUrl: './stock-attach.component.html',
  styleUrls: ['./stock-attach.component.styl']
})
export class StockAttachComponent implements OnInit {

  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();
  @Input()
    selectedStock: StockInventory;
  createCeForm: FormGroup;
  connectionModes: Array<any>;
  sdwanNetworks: Array<SdwanInventory> = [];
  countrys = NodeMap;
  provinces = null;
  citys = null;
  allBandwidth: Array<any>;
  selectedBandwith: any;
  bandwidthTips = false;
  connectionTypes = [{name: '专线连接', value: 'TUNNEL'}, {name: 'SD-WAN连接', value: 'SDWAN'}];
  l3Protocols = [{name: 'BGP', value: 'BGP'}, {name: 'NAT', value: 'NAT'}];
  dialogOptions = {
    title: '指定客户',
    width: '580px',
    visible: false,
    changeHeight: 0
  };
  UtilsconnectionMode = ConnectionMode;

  constructor(
    private fb: FormBuilder,
    private ceService: CeService,
    private sdwanService: SdwanService
  ) {
  }

  ngOnInit() {
    this.createForm();
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.sdwanNetworks = null;
    this.resetForm();
    this.getAllBandwidth();
    this.listConnectionMode(this.selectedStock.model);

    if (this.selectedStock.os === 'vyos') {
      this.connectionTypes = [{name: '专线连接', value: 'TUNNEL'}, {name: 'SD-WAN连接', value: 'SDWAN'}];
    }else {
      this.connectionTypes = [{name: 'SD-WAN连接', value: 'SDWAN'}];
    }
  }

  listConnectionMode(model) {
    const sub = this.ceService.listConnection(model, (datas) => {
      sub.unsubscribe();
      this.connectionModes = datas;
      if (datas.length) {
        this.createCeForm.patchValue({
          connectionMode: this.connectionModes[0]
        });
      }
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
      connectionType: [''],
      connectionMode: ['', Validators.required],
      sdwanNetworkUuid: ['', Validators.required],
      applyTemplate: [false],
      country: [''],
      province: [''],
      city: [''],
      l3Protocol: [''],
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

  get connectionType() {
    return this.createCeForm.get('connectionType');
  }

  get connectionMode() {
    return this.createCeForm.get('connectionMode');
  }

  get sdwanNetworkUuid() {
    return this.createCeForm.get('sdwanNetworkUuid');
  }

  get applyTemplate() {
    return this.createCeForm.get('applyTemplate');
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

  resetForm() {
    this.createCeForm.reset({
      name: '',
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
    let doCreate = false;
    const ce = new CeInventory();
    ce.uuid = this.selectedStock.uuid;
    ce.accountUuid = this.accountRef.value.uuid;
    ce.name = this.name.value;
    ce.connectionType = this.connectionType.value;
    ce.connectionMode = this.connectionMode.value;

    if (this.connectionType.value === 'SDWAN') {
      ce.sdwanNetworkUuid = this.sdwanNetworkUuid.value;
      if (this.selectedStock.os === 'vyos') {
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
        doCreate = true;
        ce.bandwidthOfferingUuid = this.selectedBandwith.name;
      }
    }else {
      doCreate = true;
      ce.bandwidthOfferingUuid = null;
      ce.vpnType = null;
    }
    if (doCreate) {
      this.done.emit(ce);
      this.dialogOptions.visible = false;
    }
  }

}
