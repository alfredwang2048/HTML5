import {
  AfterContentChecked,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {PageSize} from '../../../model';
import {QueryObject} from '../../../base';
import {CeService} from '../../../shared/sdwan/ce.service';

@Component({
  selector: 'app-ce-application-link-detail-list',
  templateUrl: './ce-application-link-detail-list.component.html',
  styleUrls: ['./ce-application-link-detail-list.component.styl']
})
export class CeApplicationLinkDetailListComponent implements OnInit, AfterContentChecked {
  @Input()
    selecedItem: any;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();
  @Input()
    isModel = false;
  dialogOptions = {
    title: '应用定义',
    width: '600px',
    visible: false,
    changeHeight: 0
  };
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  applicationLists = [];
  selectedItems: Array<string> = [];
  gridLoading = false;
  input_box = false;
  constructor(
    private ceService: CeService
  ) { }

  ngOnInit() {
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.pagination.current = 1;
    this.input_box = false;
    this.search();
  }

  reset() {
    this.selectedItems = [];
    this.input_box = false;
  }

  ngAfterContentChecked() {
    this.dialogOptions.changeHeight ++;
  }

  addDone(params) {
    this.done.emit({type: 'add', data: params});
  }

  clickId() {
    this.selectedItems = this.applicationLists.filter(item => item.status).map(it => it.uuid);
  }

  selectAll(value) {
    if (value) {
      this.applicationLists.map(item => {
        item.status = true;
      });
    }else {
      this.applicationLists.map(item => {
        item.status = false;
      });
    }
    this.clickId();
  }

  deleteApplication() {
    let infoPage = null;
    if (this.isModel) {
      infoPage = {
        appModelUuid: this.selecedItem.uuid,
        uuids: this.selectedItems
      };
    }else {
      infoPage = {
        appUuid: this.selecedItem.uuid,
        uuids: this.selectedItems
      };
    }
    this.done.emit({type: 'delete', data: infoPage});
  }

  search(isCreate = false) {
    this.applicationLists = [];
    if (isCreate) {this.pagination.current = 1; }
    const qobj = new QueryObject();
    qobj.start = isCreate ? 0 : (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    qobj.addCondition({name: this.isModel ? 'appModelUuid' : 'appUuid', op: '=', value: this.selecedItem.uuid});
    qobj.sortBy = this.isModel ? 'createDate' : 'number';
    qobj.sortDirection = 'desc';
    this.gridLoading = true;
    const sub = this.ceService.queryAppDefinition(qobj, (datas, total) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.applicationLists = datas;
      this.pagination.total = total;
      this.pagination.show = total !== 0;
      this.dialogOptions.changeHeight ++;
      if (total) {
        this.applicationLists = this.applicationLists.filter(item => item.configStatus !== 'Deleted');
      }
    }, this.isModel);
  }

  pageChange(size: number, isSize: boolean) {
    if (isSize) {
      this.pagination.current = 1;
      this.pagination.size = size;
    } else {
      this.pagination.current = size;
    }
    this.search();
  }

  close() {
    this.dialogOptions.visible = false;
  }
}
