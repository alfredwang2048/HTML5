import {Component, Input, OnInit} from '@angular/core';
import {StockInventory} from '../../../shared/sdwan';
import {timeStampRoundToString} from '../../../model/utils';

@Component({
  selector: 'app-stock-detail',
  templateUrl: './stock-detail.component.html',
  styleUrls: ['./stock-detail.component.styl']
})
export class StockDetailComponent implements OnInit {

  @Input()
  selectedItem: StockInventory;
  modelOption = {
    title: 'CPE库存详情',
    width: '415px',
    toggle: false
  };
  width = '800px';
  lasterTime;
  constructor() { }

  ngOnInit() {
  }

  open() {
    this.modelOption.toggle = true;
    this.lasterTime = timeStampRoundToString((new Date().getTime() - new Date(this.selectedItem.heartBeat).getTime()) / 1000);
  }

}
