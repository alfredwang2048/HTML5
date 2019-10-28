import {Component, OnInit, Input} from '@angular/core';
import {QueryObject} from '../../base';
import {AccountService} from '../../shared/account';
import {SdwanService} from '../../shared/sdwan/';

@Component({
  selector: 'app-set-manager',
  templateUrl: './set-manager.component.html',
  styleUrls: ['./set-manager.component.styl']
})
export class SetManagerComponent implements OnInit {

  @Input()
  selectedItem: any;
  @Input()
  inputResourceType: string;

  listManagers = {
    business: null,
    project: null,
    customer: null
  };
  infoPage = {
    resourceUuid: null,
    resourceType: null,
    businessManagerUuid: null,
    businessManagerName: null,
    projectManagerUuid: null,
    projectManagerName: null,
    customerManagerUuid: null,
    customerManagerName: null
  };
  dialogOptions = {
    title: '设置联系人',
    width: '400px',
    visible: false,
    changeHeight: 0
  };

  constructor(private acMgr: AccountService,
              private sdServer: SdwanService) {
  }

  ngOnInit() {
  }

  openDialog() {
    this.reset();
    this.dialogOptions.visible = true;

    /*查询产品负责人*/
    const qobj = new QueryObject();
    qobj.addCondition({name: 'resourceUuid', op: '=', value: this.selectedItem.uuid});
    this.sdServer.queryResourceManagerRole(qobj, (datas) => {
      if (datas.length) {
        datas.forEach((item) => {
          if (item.managerRole === 'Business') {
            this.infoPage.businessManagerUuid = item.userUuid;
            this.infoPage.businessManagerName = item.userName;
          } else if (item.managerRole === 'Project') {
            this.infoPage.projectManagerUuid = item.userUuid;
            this.infoPage.projectManagerName = item.userName;
          } else if (item.managerRole === 'Customer') {
            this.infoPage.customerManagerUuid = item.userUuid;
            this.infoPage.customerManagerName = item.userName;
          }
        });
      }

      this.getManagerFun('Business', (datasB) => {
        this.listManagers.business = [];
        datasB.forEach((item) => {
          this.listManagers.business.push({
            uuid: item.uuid,
            name: item.name,
            isDisabled: false
          });
        });
        this.listManagers.business.unshift({uuid: '', name: '无', isDisabled: false});
        if (!this.infoPage.businessManagerUuid) {
          this.infoPage.businessManagerUuid = this.listManagers.business[0].uuid;
        } else {
          let addFlag = true;
          this.listManagers.business.forEach((item) => {
            if (item.uuid === this.infoPage.businessManagerUuid) {
              this.infoPage.businessManagerUuid = item.uuid;
              addFlag = false;
            }
          });
          if (addFlag) {
            this.listManagers.business.unshift(
              {uuid: this.infoPage.businessManagerUuid, name: this.infoPage.businessManagerName, isDisabled: true}
            );
          }
        }
      });

      this.getManagerFun('Project', (datasB) => {
        this.listManagers.project = [];
        datasB.forEach((item) => {
          this.listManagers.project.push({
            uuid: item.uuid,
            name: item.name,
            isDisabled: false
          });
        });
        this.listManagers.project.unshift({uuid: '', name: '无', isDisabled: false});
        if (!this.infoPage.projectManagerUuid) {
          this.infoPage.projectManagerUuid = this.listManagers.project[0].uuid;
        } else {
          let addFlag = true;
          this.listManagers.project.forEach((item) => {
            if (item.uuid === this.infoPage.projectManagerUuid) {
              this.infoPage.projectManagerUuid = item.uuid;
              addFlag = false;
            }
          });
          if (addFlag) {
            this.listManagers.project.unshift(
              {uuid: this.infoPage.projectManagerUuid, name: this.infoPage.projectManagerName, isDisabled: true}
            );
          }
        }
      });

      this.getManagerFun('Customer', (datasB) => {
        this.listManagers.customer = [];
        datasB.forEach((item) => {
          this.listManagers.customer.push({
            uuid: item.uuid,
            name: item.name,
            isDisabled: false
          });
        });
        this.listManagers.customer.unshift({uuid: '', name: '无', isDisabled: false});
        if (!this.infoPage.customerManagerUuid) {
          this.infoPage.customerManagerUuid = this.listManagers.customer[0].uuid;
        } else {
          let addFlag = true;
          this.listManagers.customer.forEach((item) => {
            if (item.uuid === this.infoPage.customerManagerUuid) {
              this.infoPage.customerManagerUuid = item.uuid;
              addFlag = false;
            }
          });
          if (addFlag) {
            this.listManagers.customer.unshift(
              {uuid: this.infoPage.customerManagerUuid, name: this.infoPage.customerManagerName, isDisabled: true}
            );
          }
        }
      });

    });
  }

  getManagerFun(value, done: (datas: any) => void) {
    const qobj = new QueryObject();
    qobj.fields = ['name', 'uuid'];
    qobj.addCondition({name: 'userManagerRole.managerRole', op: '=', value: value});
    this.acMgr.queryUser(qobj, (datas) => {
      done(datas);
    });
  }

  reset() {
    this.listManagers = {
      business: null,
      project: null,
      customer: null
    };
    this.infoPage = {
      resourceUuid: null,
      resourceType: null,
      businessManagerUuid: null,
      businessManagerName: null,
      projectManagerUuid: null,
      projectManagerName: null,
      customerManagerUuid: null,
      customerManagerName: null
    };
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    this.infoPage.resourceUuid = this.selectedItem.uuid;
    this.infoPage.resourceType = this.inputResourceType;
    this.sdServer.setResourceManager(this.infoPage, () => {
      this.dialogOptions.visible = false;
    });
  }

}
