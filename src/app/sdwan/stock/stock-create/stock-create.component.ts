import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {findCityByProvince, findProvivceByCountry} from '../../../model';
import {QueryObject} from '../../../base';
import {CeService} from '../../../shared/sdwan/ce.service';
import {CeInventory, StockInventory, StockService} from '../../../shared/sdwan';

@Component({
  selector: 'app-stock-create',
  templateUrl: './stock-create.component.html',
  styleUrls: ['./stock-create.component.styl']
})
export class StockCreateComponent implements OnInit {

  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();
  createStockForm: FormGroup;
  models: Array<any> = null;
  dialogOptions = {
    title: '新增库存',
    width: '500px',
    visible: false,
    changeHeight: 0
  };

  constructor(
    private fb: FormBuilder,
    private ceService: CeService
  ) {
  }

  ngOnInit() {
    this.createForm();
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.resetForm();
    this.getModels();
  }

  getModels() {
    const qobj = new QueryObject();
    qobj.groupBy = 'model';
    qobj.conditions = [];
    qobj.fields = ['model'];
    const sub = this.ceService.queryModels(qobj, (datas: any, total) => {
      sub.unsubscribe();
      if (total) {
        this.createStockForm.patchValue({
          model: datas[0].model
        });
      }
      this.models = datas;
    });
  }

  createForm() {
    this.createStockForm = this.fb.group({
      model: ['', [Validators.required]],
      esn: ['', Validators.required],
    });
  }

  resetForm() {
    this.createStockForm.reset({
      model: null,
      esn: '',
    });
  }

  get model() {
    return this.createStockForm.get('model');
  }

  get esn() {
    return this.createStockForm.get('esn');
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    const stock = new StockInventory();
    stock.model = this.model.value;
    stock.esn = this.esn.value;
    this.done.emit(stock);
    this.dialogOptions.visible = false;
  }

}
