import {Component, Input, OnInit} from '@angular/core';
import {CeModelInventory, CeModelService} from '../../../shared/sdwan';
import {QueryObject} from '../../../base/api';

@Component({
  selector: 'app-ce-model-detail',
  templateUrl: './ce-model-detail.component.html',
  styleUrls: ['./ce-model-detail.component.styl']
})
export class CeModelDetailComponent implements OnInit {
  @Input()
  selectedItem: CeModelInventory;
  modelOption = {
    title: 'CPE型号详情',
    width: '500px',
    toggle: false
  };
  portModels = [{
    name: 'DOUBLE_TUNNEL',
    text: '双专线',
    models: []
  }, {
    name: 'DOUBLE_INTERNET',
    text: '双公网',
    models: []
  }, {
    name: 'TUNNEL_INTERNET',
    text: '专线+公网',
    models: []
  }];
  gridLoading = false;
  constructor(private ceModelSerivce: CeModelService) { }

  ngOnInit() {
  }
  open() {
    this.modelOption.toggle = true;
    this.queryPort();
  }
  queryPort() {
    const qobj = new QueryObject();
    qobj.conditions = [{name: 'model', op: '=', value: this.selectedItem.model}];
    this.gridLoading = true;
    const models1 = [],
      models2 = [],
      models3 = [];
    this.ceModelSerivce.queryPort(qobj, (portModels) => {
      this.gridLoading = false;
      portModels.forEach((m) => {
        if (m.mode === 'DOUBLE_TUNNEL') {
          models1.push(m);
        }else if (m.mode === 'DOUBLE_INTERNET') {
          models2.push(m);
        }else if (m.mode === 'TUNNEL_INTERNET') {
          models3.push(m);
        }
      });
      this.portModels[0].models = models1;
      this.portModels[1].models = models2;
      this.portModels[2].models = models3;
    });
  }
}
