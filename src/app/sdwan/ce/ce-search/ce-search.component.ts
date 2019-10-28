import {Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Model} from '../../../m-common/relate-input/relate-input.component';
import {AccountInventory} from '../../../shared/account';
import {QueryCondition} from '../../../base';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-ce-search',
  templateUrl: './ce-search.component.html',
  styleUrls: ['./ce-search.component.styl']
})
export class CeSearchComponent implements OnInit, OnChanges {
  @Input()
  searchInitObj = {name: '', value: ''};
  @Input()
  searchInitObj2 = {otherName: '', otherValue: ''};

  relateOptions: Array<Model> = [{
    name: 'number',
    value: '序号',
    op: '=',
    hasRelate: false
  }, {
    name: 'esn',
    value: 'ESN号',
    op: 'like',
    hasRelate: false
  }, {
    name: 'name',
    value: 'CPE名称',
    op: 'like',
    hasRelate: false
  }, {
    name: 'uuid',
    value: 'UUID',
    op: '=',
    hasRelate: false
  }, {
    name: 'popInfos.vpeUuid',
    value: 'vpeUUID',
    op: '=',
    hasRelate: false
  }, {
    name: 'status',
    value: '状态',
    op: '=',
    hasRelate: true,
    list: [{name: '', value: '全部'}, {name: 'online', value: '已连接'}, {name: 'offline', value: '未连接'}]
  }, {
    name: 'state',
    value: '状况',
    op: '=',
    hasRelate: true,
    list: [{name: '', value: '全部'}, {name: 'Enabled', value: '已启用'}, {name: 'Disabled', value: '已禁用'}]
  }, {
    name: 'connectionType',
    value: '连接类型',
    op: '=',
    hasRelate: true,
    list: [{name: '', value: '全部'}, {name: 'TUNNEL', value: '专线连接'}, {name: 'SDWAN', value: 'SD-WAN连接'}]
  }, {
    name: 'sdwanNetworkUuid',
    value: 'SD-WAN网络UUID',
    op: '=',
    hasRelate: false
  }/*, {
    name: 'masterStatus',
    alisName: 'popInfos.status',
    otherConditions: [{name: 'popInfos.haType', op: '=', value: 'Master'}],
    value: '主连接状态',
    op: '=',
    hasRelate: true,
    list: [{name: '', value: '全部'}, {name: 'Connected', value: '正常'}, {name: 'Connecting', value: '连接中'}, {name: 'Disconnected', value: '异常'}]
  }, {
    name: 'slaveStatus',
    alisName: 'popInfos.status',
    otherConditions: [{name: 'popInfos.haType', op: '=', value: 'Slave'}],
    value: '备连接状态',
    op: '=',
    hasRelate: true,
    list: [{name: '', value: '全部'}, {name: 'Connected', value: '正常'}, {name: 'Connecting', value: '连接中'}, {name: 'Disconnected', value: '异常'}]
  }*/];
  relateOptions2: Array<Model> = [
    {
      name: 'masterStatus',
      alisName: 'popInfos.status',
      otherConditions: [{name: 'popInfos.haType', op: '=', value: 'Master'}],
      value: '主连接状态',
      op: '=',
      hasRelate: true,
      list: [{name: '', value: '全部'}, {name: 'Connected', value: '正常'}, {name: 'Connecting', value: '连接中'}, {name: 'Disconnected', value: '异常'}]
    }, {
      name: 'slaveStatus',
      alisName: 'popInfos.status',
      otherConditions: [{name: 'popInfos.haType', op: '=', value: 'Slave'}],
      value: '备连接状态',
      op: '=',
      hasRelate: true,
      list: [{name: '', value: '全部'}, {name: 'Connected', value: '正常'}, {name: 'Connecting', value: '连接中'}, {name: 'Disconnected', value: '异常'}]
    }
  ];
  selectedAccount: AccountInventory;
  selectedRelate: { model: Model, value: string };
  selectedRelate2: any;
  @Output()
  done: EventEmitter<Array<QueryCondition>> = new EventEmitter();
  constructor(private router: Router, private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    if (this.searchInitObj && this.searchInitObj.name) {
      if (this.relateOptions.find(item => item.name === this.searchInitObj.name)) {
        this.selectedRelate = {
          model: this.relateOptions.find(item => item.name === this.searchInitObj.name),
          value: this.searchInitObj.value
        };
      }else {
        this.selectedRelate = {model: this.relateOptions[0], value: ''};
        this.searchInitObj.name = 'number';
        this.searchInitObj.value = '';
      }
    }
    if (this.searchInitObj2 && this.searchInitObj2.otherName) {
      if (this.relateOptions2.find(item => item.name === this.searchInitObj2.otherName)) {
        this.selectedRelate2 = {
          model: this.relateOptions2.find(item => item.name === this.searchInitObj2.otherName),
          value: this.searchInitObj2.otherValue
        };
      }else {
        this.selectedRelate2 = {model: this.relateOptions2[0], value: ''};
        this.searchInitObj2.otherName = 'masterStatus';
        this.searchInitObj2.otherValue = '';
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.searchInitObj && !changes.searchInitObj.firstChange) || (changes.searchInitObj2 && ! changes.searchInitObj2.firstChange)) {
      if (changes.searchInitObj) {
        if (this.relateOptions.find(item => item.name === this.searchInitObj.name)) {
          this.selectedRelate = {
            model: this.relateOptions.find(item => item.name === this.searchInitObj.name),
            value: this.searchInitObj.value
          };
        }else {
          this.selectedRelate = {model: this.relateOptions[0], value: ''};
          this.searchInitObj.name = 'number';
          this.searchInitObj.value = '';
        }
      }
      if (changes.searchInitObj2) {
        if (this.relateOptions2.find(item => item.name === this.searchInitObj2.otherName)) {
          this.selectedRelate2 = {
            model: this.relateOptions2.find(item => item.name === this.searchInitObj2.otherName),
            value: this.searchInitObj2.otherValue
          };
        }else {
          this.selectedRelate2 = {model: this.relateOptions2[0], value: ''};
          this.searchInitObj2.otherName = 'masterStatus';
          this.searchInitObj2.otherValue = '';
        }
      }
      const conds = this.getConditions();
      this.doneEvent(conds);
    }
  }

  relateChange(m: {model: Model, value: string}) {
    this.selectedRelate = m;
  }

  relateChange2(m: {model: Model, value: string}) {
    this.selectedRelate2 = m;
  }

  getConditions() {
    const conds = [];
    if (this.selectedAccount) {
      conds.push({name: 'accountUuid', op: '=', value: this.selectedAccount.uuid});
    }
    if (this.selectedRelate && this.selectedRelate.value) {
      conds.push({
        name: this.selectedRelate.model.name,
        op: this.selectedRelate.model.op,
        value: this.selectedRelate.value
      });
    }
    if (this.selectedRelate2 && this.selectedRelate2.value) {
      conds.push({
        otherName: this.selectedRelate2.model.name,
        op: this.selectedRelate2.model.op,
        otherValue: this.selectedRelate2.value
      });
    }
    return conds;
  }

  searchHandler() {
    const conds = this.getConditions();
    if (!conds.length) {
      if (this.activeRoute.snapshot.queryParams.value) {
        this.router.navigate(['/sdwan/cpe']);
      }else {
        this.doneEvent(conds);
      }
    }else {
      if (conds.filter(item => item.name === 'accountUuid').length) {
        this.doneEvent(conds);
      }else {
        const queryParamObj = {};
        conds.forEach(item => {
          if (item.name) {
            queryParamObj['name'] = item.name;
            queryParamObj['value'] = item.value;
          }
          if (item.otherName) {
            queryParamObj['otherName'] = item.otherName;
            queryParamObj['otherValue'] = item.otherValue;
          }
        });

        if ((this.activeRoute.snapshot.queryParams.value !== queryParamObj['value']) || this.activeRoute.snapshot.queryParams.otherValue !== queryParamObj['otherValue'] ) {
          this.router.navigate(['/sdwan/cpe'], {queryParams: queryParamObj});
        }else {
          this.doneEvent(conds);
        }
      }
    }
  }

  doneEvent(conds) {
    conds.map((item, key) => {
      if (item.otherName === 'masterStatus') {
        conds.push({name: 'popInfos.haType', op: '=', value: 'Master'}, {name: 'popInfos.status', op: '=', value: item.otherValue});
        conds.splice(key, 1);
      }else if (item.otherName === 'slaveStatus') {
        conds.push({name: 'popInfos.haType', op: '=', value: 'Slave'}, {name: 'popInfos.status', op: '=', value: item.otherValue});
        conds.splice(key, 1);
      }
      item.value = item.op === 'like' ? `%${item.value}%` : item.value;
    });
    this.done.emit(conds);
  }
}
