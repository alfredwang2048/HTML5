import {Component, Input, OnInit} from '@angular/core';
import {VpePeInterfaceInventory, VpeService} from '../../../shared/sdwan';
import {QueryObject} from '../../../base';

@Component({
  selector: 'app-vpe-pe-detail',
  templateUrl: './vpe-pe-detail.component.html',
  styleUrls: ['./vpe-pe-detail.component.styl']
})
export class VpePeDetailComponent implements OnInit {

  @Input()
  selectedItem: VpePeInterfaceInventory;
  modelOption = {
    width: '500px',
    title: 'VPE-PE接口详情',
    toggle: false
  };

  constructor(private vpeService: VpeService) {
  }

  ngOnInit() {
  }

  open() {
    this.modelOption.toggle = true;
  }

}
