import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { DialogOptions } from '../w-dialog/w-dialog.component';
import { Model, Relate } from '../relate-input/relate-input.component';
import { QueryCondition, QueryObject } from '../../base/api';
import { AccountInventory, AccountService } from '../../shared/account';
import { PageSize } from '../../model';

@Component({
  selector: 'app-search-account',
  templateUrl: './search-account.component.html',
  styleUrls: ['./search-account.component.styl'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchAccountComponent),
      multi: true
    }
  ]
})
export class SearchAccountComponent implements OnInit, OnDestroy, ControlValueAccessor {
  accountName = '';
  @Input()
  selectedAccount: AccountInventory;
  @Input()
  inputWidth: number;
  @Output()
  selectedAccountChange: EventEmitter<AccountInventory> = new EventEmitter();
  dialogOptions: DialogOptions;
  searchConditionNames: Array<Model> = SearchConditions.slice();
  searchDefault = {
    name: '',
    value: ''
  };
  conditions: Array<QueryCondition> = [];
  accounts: Array<AccountInventory> = [];
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next']
  };
  timer: any;
  subscription: Subscription;
  private controlChange: Function = () => {
  }
  private touchedChange: Function = () => {
  }

  constructor(private accountMgr: AccountService) {
  }

  ngOnInit() {
    this.dialogOptions = {
      title: '账户查询',
      width: '600px',
      top: '50%',
      visible: false,
      changeHeight: 0
    };
    this.searchDefault.name = this.searchConditionNames[0].name;
    this.searchDefault.value = this.searchConditionNames[0].hasRelate ? this.searchConditionNames[0].list[0].name : '';
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.accounts = [];
    this.searchDefault.name = this.searchConditionNames[0].name;
    this.searchDefault.value = this.searchConditionNames[0].hasRelate ? this.searchConditionNames[0].list[0].name : '';
    this.dialogOptions.changeHeight = 0;
    this.conditions = [];
  }

  search() {
    if (this.conditions.length > 0) {
      const qobj = new QueryObject();
      qobj.start = (this.pagination.current - 1) * this.pagination.size;
      qobj.limit = this.pagination.size;
      qobj.conditions = this.conditions;
      this.subscription = this.accountMgr.query(qobj, (accounts, total) => {
        this.accounts = accounts;
        this.pagination.total = total;
        this.pagination.show = !!total;
        this.timer = setTimeout(() => {
          if (this.timer) {
            clearTimeout(this.timer);
          }
          this.dialogOptions.changeHeight++;
        }, 0);
      });
    } else {
      this.accounts = [];
      this.pagination.show = false;
      setTimeout(() => {
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.dialogOptions.changeHeight++;
      }, 0);
    }
  }

  writeValue(value) {
    if (value) {
      this.selectedAccount = value;
    } else {
      this.selectedAccount = value;
      this.accountName = '';
    }
  }

  registerOnChange(fn) {
    this.controlChange = fn;
  }

  registerOnTouched(fn) {
    this.touchedChange = fn;
  }

  cancel() {
    this.selectedAccount = null;
    this.accountName = '';
    this.selectedAccountChange.emit(this.selectedAccount);
    this.controlChange(this.selectedAccount);
  }

  conditionChange(relate: Relate) {
    this.searchDefault.name = relate.model.name;
    this.searchDefault.value = relate.value;
    if (relate.value) {
      this.conditions = [];
      const cond = new QueryCondition();
      cond.name = relate.model.name;
      cond.op = relate.model.op;
      cond.value = cond.op === 'like' ? `%${relate.value}%` : relate.value;
      this.conditions.push(cond);
    }
  }

  keyUpDone() {
    this.search();
  }

  pageChange(size: number, isSize: boolean) {
    if (isSize) {
      this.pagination.size = size;
    } else {
      this.pagination.current = size;
    }
    this.search();
  }

  selectionChange(selectEvent) {
    this.selectedAccount = selectEvent.rowData;
  }

  cancelSelect() {
    this.cancel();
    this.dialogOptions.visible = false;
  }

  confirmSelect() {
    if (this.selectedAccount) {
      this.accountName = this.selectedAccount.name;
    }
    this.selectedAccountChange.emit(this.selectedAccount);
    this.controlChange(this.selectedAccount);
    this.dialogOptions.visible = false;
  }

  ngOnDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

const SearchConditions = [
  {
    name: 'name',
    value: '账户名',
    op: 'like',
    hasRelate: false
  }, {
    name: 'phone',
    value: '手机号',
    op: 'like',
    hasRelate: false
  }, {
    name: 'company',
    value: '公司名',
    op: 'like',
    hasRelate: false
  }, {
    name: 'uuid',
    value: 'uuid',
    op: '=',
    hasRelate: false
  }
];
