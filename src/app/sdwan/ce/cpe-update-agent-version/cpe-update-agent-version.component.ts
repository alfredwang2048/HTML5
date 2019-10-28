import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CeService} from '../../../shared/sdwan/ce.service';
import {QueryObject} from '../../../base';
import {PageSize} from '../../../model';

@Component({
  selector: 'app-cpe-update-agent-version',
  templateUrl: './cpe-update-agent-version.component.html',
  styleUrls: ['./cpe-update-agent-version.component.styl']
})
export class CpeUpdateAgentVersionComponent implements OnInit {

  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  ceInfos: any;
  dialogOptions = {
    title: '更新版本',
    width: '400px',
    visible: false,
    changeHeight: 0
  };
  model = {
    agentVersion: null,
    createDate: null,
    description: null
  };
  agentVersions: Array<any> = [];
  constructor(
    private ceService: CeService
  ) { }

  ngOnInit() {
  }

  openDialog() {
    this.dialogOptions.visible = true;
    const qobj = new QueryObject();
    qobj.start = 0;
    qobj.limit = 1;
    qobj.conditions = [];
    qobj.sortBy = 'createDate';
    qobj.sortDirection = 'desc';
    qobj.addCondition({name: 'os', op: '=', value: this.ceInfos.ceInventory.os});
    const sub = this.ceService.queryAgentVersion(qobj, (datas) => {
      if (datas.length) {
        this.agentVersions = datas;
        this.model.agentVersion = datas[0].version;
        this.model.createDate = datas[0].createDate;
        this.model.description = datas[0].description;
        /*if (datas.filter(item => item.version === this.ceInfos.ceInventory.agentVersion).length) {
          this.agentVersions = datas.filter(item => {
            return new Date(item.createDate).getTime() >= new Date(datas.filter(it => it.version === this.ceInfos.ceInventory.agentVersion)[0].createDate).getTime();
          });
        }else {
          this.agentVersions = datas;
        }
        this.model.agentVersion = datas.filter(item => item.version === this.ceInfos.ceInventory.agentVersion).length ? this.ceInfos.ceInventory.agentVersion : datas[0].version;
        this.model.createDate = datas.filter(item => item.version === this.model.agentVersion)[0].createDate;
        this.model.description = datas.filter(item => item.version === this.model.agentVersion)[0].description;*/
      }
    });
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  changeVersion(version) {
    this.model.createDate = this.agentVersions.filter(item => item.version === version)[0].createDate;
    this.model.description = this.agentVersions.filter(item => item.version === version)[0].description;
  }

  confirm() {
    const infoPage = {
      uuid: this.ceInfos.ceInventory.uuid,
      agentVersion: this.model.agentVersion
    };
    this.dialogOptions.visible = false;
    this.done.emit(infoPage);
  }

}
