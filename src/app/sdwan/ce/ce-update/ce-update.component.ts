import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import {CeInventory} from '../../../shared/sdwan';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CeService} from '../../../shared/sdwan/ce.service';
import {findCityByProvince, findProvivceByCountry, NodeMap} from '../../../model';

@Component({
  selector: 'app-ce-update',
  templateUrl: './ce-update.component.html',
  styleUrls: ['./ce-update.component.styl']
})
export class CeUpdateComponent implements OnInit {
  @Output()
  done: EventEmitter<CeInventory> = new EventEmitter();
  @Input()
  selectedCe: CeInventory;
  updateCeForm: FormGroup;
  countrys = NodeMap;
  provinces = null;
  citys = null;
  dialogOptions = {
    title: '修改CPE',
    width: '400px',
    visible: false,
    changeHeight: 0
  };

  constructor(
    private fb: FormBuilder,
    private ceService: CeService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.updateCeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(6)]],
      address: ['', Validators.required],
      description: ['', Validators.maxLength(128)],
      country: [''],
      province: [''],
      city: [''],
    });
  }

  get name() {
    return this.updateCeForm.get('name');
  }

  get address() {
    return this.updateCeForm.get('address');
  }

  get description() {
    return this.updateCeForm.get('description');
  }

  get country() {
    return this.updateCeForm.get('country');
  }

  get province() {
    return this.updateCeForm.get('province');
  }

  get city() {
    return this.updateCeForm.get('city');
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.updateCeForm.patchValue({
      name: this.selectedCe.name,
      address: this.selectedCe.address,
      description: this.selectedCe.description,
      country: this.countrys.filter(item => item.en === this.selectedCe.country)[0] ?
        this.countrys.filter(item => item.en === this.selectedCe.country)[0].en
        :
        this.countrys.filter(item => item.zh === this.selectedCe.country)[0].en,
      province: this.selectedCe.province,
      city: this.selectedCe.city,
    });
    this.provinces = findProvivceByCountry(this.country.value);
    this.citys = findCityByProvince(this.province.value);
  }

  changeArea() {
    this.provinces = findProvivceByCountry(this.country.value);
    this.updateCeForm.patchValue({province: this.provinces[0].zh});
    this.citys = findCityByProvince(this.province.value);
    this.updateCeForm.patchValue({city: this.provinces[0].zh});
  }

  changeProvince() {
    this.citys = findCityByProvince(this.province.value);
    this.updateCeForm.patchValue({city: this.citys[0].zh});
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const ce = new CeInventory();
    ce.uuid = this.selectedCe.uuid;
    ce.name = this.name.value;
    ce.address = this.address.value;
    ce.description = this.description.value;
    ce.country = this.country.value;
    ce.province = this.province.value;
    ce.city = this.city.value;
    this.done.emit(ce);
    this.dialogOptions.visible = false;
  }

}
