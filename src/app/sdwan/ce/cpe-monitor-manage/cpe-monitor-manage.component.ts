import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PageSize} from '../../../model';
import {CeInventory, CeService, CpeMonitorTaskInventory} from '../../../shared/sdwan';
import {QueryObject} from '../../../base';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-cpe-monitor-manage',
  templateUrl: './cpe-monitor-manage.component.html',
  styleUrls: ['./cpe-monitor-manage.component.styl']
})
export class CpeMonitorManageComponent implements OnInit {

  @Input()
    selectedCe: CeInventory;
  @Output()
    done: EventEmitter<any> = new EventEmitter<any>();
  dialogOptions = {
    title: 'CPE监控',
    width: '840px',
    visible: false,
    changeHeight: 0
  };
  navTabLists = [{text: '多次', value: 'multi'}, {text: '单次', value: 'single'}];
  currentTab = this.navTabLists[0];
  datas: Array<CpeMonitorTaskInventory> = [];
  addTaskForm: FormGroup;
  devs: Array<any>;
  types = [{text: '接口', value: 'dev'}, {text: '源IP', value: 'ip'}];
  gridLoading = false;
  isClick = false;
  pingResults: Array<any> = [];
  timer_pingResult = null;
  pagination = {
    show: false,
    size: PageSize,
    current: 1,
    total: 0,
    layout: ['prev', 'pager', 'next', 'jump', 'size']
  };
  constructor(
    private ceService: CeService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  search() {
    this.gridLoading = true;
    const qobj = new QueryObject();
    qobj.start = (this.pagination.current - 1) * this.pagination.size;
    qobj.limit = this.pagination.size;
    qobj.replyWidthCount = true;
    qobj.count = false;
    qobj.sortBy = 'createDate';
    qobj.sortDirection = 'desc';
    qobj.addCondition({name: 'ceUuid', op: '=', value: this.selectedCe.uuid});
    const sub = this.ceService.queryMonitorTask(qobj, (datas: Array<CpeMonitorTaskInventory>, total: number) => {
      sub.unsubscribe();
      this.gridLoading = false;
      this.datas = datas;
      this.pagination.total = total;
      this.pagination.show = total !== 0;
      this.dialogOptions.changeHeight ++ ;
    });
  }

  openMonitor(e: Event, data: CpeMonitorTaskInventory) {
    e.stopPropagation();
    this.done.emit({type: 'monitor', params: data});
  }

  openDialog() {
    this.dialogOptions.visible = true;
    this.search();
    this.resetForm();
    this.getCePort();
    this.reset();
  }

  reset() {
    this.isClick = false;
    this.currentTab = this.navTabLists[0];
    this.pingResults = [];
  }

  createForm() {
    this.addTaskForm = this.fb.group({
      dev: ['', Validators.required],
      targetIp: ['', [Validators.required, Validators.pattern('^(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])$')]],
      type: ['', Validators.required],
    });
  }

  getCePort() {
    const sub = this.ceService.getCePort(this.selectedCe.uuid, (datas) => {
      sub.unsubscribe();
      this.devs = datas;
      if (this.devs.length) {
        this.addTaskForm.patchValue({
          dev: this.devs[0].dev
        });
      }
    });
  }

  resetForm() {
    this.addTaskForm.reset({
      dev: '',
      targetIp: '',
      type: this.types[0].value
    });
  }

  confirm() {
    if (this.currentTab.value === 'multi') {
      this.isClick = true;
      const infoPage = {
        ceUuid: this.selectedCe.uuid,
        dev: this.dev.value,
        targetIp: this.targetIp.value,
        type: this.type.value
      };
      const sub = this.ceService.addMonitorTask(infoPage, (data) => {
        this.isClick = false;
        sub.unsubscribe();
        this.search();
      }, () => {
        this.isClick = false;
      });
    }else {
      this.isClick = true;
      this.pingResults = [];
      const infoPage_ping = {
        ceUuid: this.selectedCe.uuid,
        dev: this.dev.value,
        targetIp: this.targetIp.value,
        type: this.type.value
      };
      const infoPage_result = {
        ceUuid: this.selectedCe.uuid,
        taskUuid: null
      };

      const obs_ping = new Observable(observer => {
        this.ceService.createPing(infoPage_ping, (data: any) => {
          observer.next(data);
        }, () => {
          this.isClick = false;
        });
      });
      const obs_result = new Observable(observer => {
        this.ceService.getPingResult(infoPage_result, (res) => {
          this.isClick = false;
          observer.next(res);
        });
      });

      const sub_ping = obs_ping.subscribe((value1: any) => {
        sub_ping.unsubscribe();
        infoPage_result.taskUuid = value1.taskUuid;
        let isLast = false;
        this.timer_pingResult = setInterval(() => {
            if (!isLast) {
              const sub_result = obs_result.subscribe((value2: any) => {
                sub_result.unsubscribe();
                if (value2.success) {
                  if (value2.result.length) {
                    this.pingResults = value2.result.filter(item => item !== 'END');
                  }
                  if (value2.result.filter(item => item === 'END').length) {
                    isLast = true;
                  }
                }
              });
            }else {
              clearInterval(this.timer_pingResult);
            }
        }, 3000);
      });
    }
  }

  deleteTask(data) {
    this.done.emit({type: 'delete', params: data});
  }

  get dev() {
    return this.addTaskForm.get('dev');
  }

  get targetIp() {
    return this.addTaskForm.get('targetIp');
  }

  get type() {
    return this.addTaskForm.get('type');
  }

  close() {
    this.dialogOptions.visible = false;
    clearInterval(this.timer_pingResult);
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
}
