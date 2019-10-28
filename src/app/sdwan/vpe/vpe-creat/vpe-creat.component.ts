import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {VpeInventory, VpeService} from '../../../shared/sdwan';
import {APINodeReply, APIQueryNodeMsg, NodeService} from '../../../shared/node';
import {QueryObject} from '../../../base';
import {distinctUntilChanged, throttleTime} from 'rxjs/operators';
import {RestApiService} from '../../../shared';

@Component({
  selector: 'app-vpe-creat',
  templateUrl: './vpe-creat.component.html',
  styleUrls: ['./vpe-creat.component.styl']
})
export class VpeCreatComponent implements OnInit {

  createVpeForm: FormGroup;
  dialogOptions = {
    title: '新建VPE',
    width: '440px',
    visible: false,
    changeHeight: 0
  };
  types = [{name: 'PROXY', value: 'PROXY'}, {name: 'FRR', value: 'FRR'}];
  @Output()
  done: EventEmitter<any> = new EventEmitter();
  public nodes;

  // 节点相关
  nodeCascadeOptions: any = {
    title: '地区',
    model: [],
    click: (model, next) => {
      if (model) {
        const qobj = new QueryObject();
        qobj.fields = ['name', 'uuid'];
        qobj.conditions = [{name: 'province', op: '=', value: model.value}];
        const sub = this.nodeService.query(qobj, (nodes) => {
          sub.unsubscribe();
          model.children.model = nodes.map(node => {
            return {
              label: node.name,
              value: node.uuid
            };
          });
          if (next) {
            next();
          }
        });
      }
    }
  };

  copyNodeCascadeOptions = {
    title: '地区',
    model: [],
    click: (model, next) => {
      if (model) {
        const qobj = new QueryObject();
        qobj.fields = ['name', 'uuid'];
        qobj.conditions = [{name: 'province', op: '=', value: model.value}];
        const sub = this.nodeService.query(qobj, (nodes) => {
          sub.unsubscribe();
          model.children.model = nodes.map(node => {
            return {
              label: node.name,
              value: node.uuid
            };
          });
          if (next) {
            next();
          }
        });
      }
    }
  };

  constructor(private fb: FormBuilder,
              private vpeService: VpeService,
              private nodeService: NodeService,
              private restApi: RestApiService) {
  }

  get code() {
    return this.createVpeForm.get('code');
  }

  get name() {
    return this.createVpeForm.get('name');
  }

  get nodeUuid() {
    return this.createVpeForm.get('nodeUuid');
  }

  get address() {
    return this.createVpeForm.get('address');
  }

  get manageIp() {
    return this.createVpeForm.get('manageIp');
  }

  get sshPort() {
    return this.createVpeForm.get('sshPort');
  }

  get username() {
    return this.createVpeForm.get('username');
  }

  get password() {
    return this.createVpeForm.get('password');
  }

  get type() {
    return this.createVpeForm.get('type');
  }

  inputLabelHandler(label: string) {
    if (label) {
      const qobj = new APIQueryNodeMsg();
      qobj.fields = ['name', 'uuid'];
      qobj.conditions = [{name: 'name', op: 'like', value: `%${label}%`}];
      this.restApi.call(qobj).pipe(
        throttleTime(300),
        distinctUntilChanged()
      ).subscribe((result: APINodeReply) => {
        if (result.success) {
          this.nodeCascadeOptions = {
            title: '节点',
            model: result.inventories.map((inv) => {
              return {
                label: inv.name,
                value: inv.uuid
              };
            })
          };
        }
      });
    } else {
      this.nodeCascadeOptions = this.copyNodeCascadeOptions;
    }
  }

  queryListProvince() {
    const sub = this.nodeService.listProvince((provinces) => {
      sub.unsubscribe();
      this.nodeCascadeOptions.model = this.copyNodeCascadeOptions.model = provinces.map(p => {
        return {
          label: p,
          value: p,
          children: {
            title: '节点',
            model: []
          }
        };
      });
    });
  }

  clear() {
    this.nodeCascadeOptions = this.copyNodeCascadeOptions;
  }

  openDialog() {
    this.resetForm();
    this.queryListProvince();
    this.dialogOptions.visible = true;
  }

  ngOnInit() {
    this.createForm();
    this.queryListProvince();
  }

  createForm() {
    this.createVpeForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nodeUuid: ['', Validators.required],
      address: ['', Validators.required],
      manageIp: ['', Validators.required],
      sshPort: '22',
      type: [''],
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  resetForm() {
    this.createVpeForm.reset({
      code: '',
      name: '',
      nodeUuid: '',
      address: '',
      manageIp: '',
      sshPort: '22',
      type: this.types[0].value,
      username: '',
      password: ''
    });
  }

  confirm() {
    const model = new VpeInventory();
    model.code = this.code.value;
    model.name = this.name.value;
    model.nodeUuid = this.nodeUuid.value;
    model.address = this.address.value;
    model.manageIp = this.manageIp.value;
    model.sshPort = this.sshPort.value;
    model.type = this.type.value;
    model.username = this.username.value;
    model.password = this.password.value;
    this.done.emit({type: 'add', data: model});
    this.dialogOptions.visible = false;
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

}
