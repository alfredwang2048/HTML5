import {Component, OnInit, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SdwanService, SdwanInventory, CeInventory, VpeService} from '../../../shared/sdwan/';
import {AppointVpeComponent} from '../appoint-vpe/appoint-vpe.component';
import {CeService} from '../../../shared/sdwan/ce.service';
import {QueryObject} from '../../../base/api';

@Component({
  selector: 'app-assign-vpe',
  templateUrl: './assign-vpe.component.html',
  styleUrls: ['./assign-vpe.component.styl']
})
export class AssignVpeComponent implements OnInit {

  assignVpeForm: FormGroup;
  dialogOptions = {
    title: '配置VPE',
    width: '450px',
    visible: false
  };
  public vpes: Array<any>;
  public selectVpe;
  currentVpe;
  distribution;

  @Input()
  selectedItem: any;
  @Output()
  done: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  assignType: string;

  @ViewChild('appointVpe')
  appointVpeRf: AppointVpeComponent;

  allVpe;
  selectVpeUuid = {};
  emitVpe = [];
  tips;
  vpeList = [];

  constructor(private fb: FormBuilder,
              private sdServer: SdwanService,
              private ceService: CeService,
              private vpeServer: VpeService,) {
  }

  ngOnInit() {
  }

  open() {
    this.reset();

    if (this.selectedItem.distribution === 'ASSIGN') {
      this.distribution = 'ASSIGN';
      this.queryVpe();
    } else {
      this.distribution = 'AUTO';
    }
    this.dialogOptions.visible = true;
  }

  reset() {
    this.currentVpe = [];
    this.distribution = null;
    this.selectVpeUuid = {};
    this.emitVpe = [];
    this.allVpe = [];
    this.tips = null;
    this.vpeList = [];
  }

  setVpeList() {
    if (this.allVpe.length) {
      let number = 3, arr = [];
      this.vpeList = [];
      this.allVpe.forEach((item, index) => {
        if (index + 1 === number) {
          arr.push(item);
          this.vpeList.push(arr);
          arr = [];
          number = number + 3;
        } else {
          arr.push(item);
          if (index + 1 === this.allVpe.length) {
            this.vpeList.push(arr);
          }
        }
      });
    }
  }

  queryVpe() {
    if (this.assignType === 'network') {
      // 查询所有VPE
      const qobj = new QueryObject();
      this.vpeServer.query(qobj, (vpes, total) => {
        this.allVpe = vpes;
        this.setVpeList();

        // 查询指定vpe
        this.sdServer.getListVpeForSdwan(this.selectedItem, (list) => {
          this.currentVpe = list;

          list.forEach((item) => {
            for (let i = 0; i < this.allVpe.length; i++) {
              if (item.uuid === this.allVpe[i].uuid) {
                this.selectVpeUuid[item.uuid] = true;
                break;
              }
            }
          });
          for (const key in this.selectVpeUuid) {
            this.allVpe.forEach((item) => {
              if (key === item.uuid) {
                this.emitVpe.push(item);
              }
            });
          }
        });
      });
    } else if (this.assignType === 'cpe') {
      // 查询多有cpe
      if (this.selectedItem.sdwanNetworkDistribution === 'ASSIGN') {
        const sdwan = new SdwanInventory();
        sdwan.uuid = this.selectedItem.sdwanNetworkUuid;
        this.sdServer.getListVpeForSdwan(sdwan, (vpes) => {
          this.allVpe = vpes;
          this.setVpeList();
          // 查询指定vpe
          this.ceService.getListVpeForCpe(this.selectedItem, (list) => {
            this.currentVpe = list;

            list.forEach((item) => {
              for (let i = 0; i < this.allVpe.length; i++) {
                if (item.uuid === this.allVpe[i].uuid) {
                  this.selectVpeUuid[item.uuid] = true;
                  break;
                }
              }
            });
            for (const key in this.selectVpeUuid) {
              this.allVpe.forEach((item) => {
                if (key === item.uuid) {
                  this.emitVpe.push(item);
                }
              });
            }
          });
        });
      } else {
        const qobj = new QueryObject();
        qobj.addCondition({name: 'state', op: 'in', value: 'Enabled,Disabled'});
        this.vpeServer.query(qobj, (vpes, total) => {
          this.allVpe = vpes;
          this.setVpeList();
          /*查询已被指定的VPE*/
          this.ceService.getListVpeForCpe(this.selectedItem, (list) => {
            this.currentVpe = list;

            list.forEach((item) => {
              for (let i = 0; i < this.allVpe.length; i++) {
                if (item.uuid === this.allVpe[i].uuid) {
                  this.selectVpeUuid[item.uuid] = true;
                  break;
                }
              }
            });
            for (const key in this.selectVpeUuid) {
              this.allVpe.forEach((item) => {
                if (key === item.uuid) {
                  this.emitVpe.push(item);
                }
              });
            }
          });
        });
      }
    }
  }

  onClickBtn(v) {
    if (v === 'AUTO') {
      this.distribution = 'AUTO';
    } else {
      this.distribution = 'ASSIGN';
      if (this.allVpe.length === 0) {
        this.queryVpe();
      }
      // this.selectVpe = this.currentVpe;
      // setTimeout(() => {
      //   this.appointVpeRf.open();
      // }, 80);
    }
    this.tips = null;
  }

  changeBox(e, vpe) {
    if (e.target.checked) {
      this.emitVpe.push(vpe);
    } else {
      this.emitVpe.forEach((item, index) => {
        if (item.uuid === vpe.uuid) {
          this.emitVpe.splice(index, 1);
          return;
        }
      });
    }
    this.tips = null;
  }

  selectDone(e) {
    this.currentVpe = e;
    this.distribution = 'ASSIGN';
  }

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    if (this.emitVpe.length < 2 && this.distribution == 'ASSIGN') {
      this.tips = '请至少指定2个VPE';
      return;
    }
    if (this.assignType === 'network') {
      const sdwan = new SdwanInventory();
      sdwan.sdwanNetworkUuid = this.selectedItem.uuid;
      sdwan.distribution = this.distribution; // AUTO ：全部  ASSIGN ：指定
      if (this.distribution === 'ASSIGN') {
        const vpeUuids = [];
        this.emitVpe.forEach((item) => {
          vpeUuids.push(item.uuid);
        });
        sdwan.vpeUuids = vpeUuids;
      }
      /*this.sdServer.assignVpe(sdwan, () => {
        this.done.emit();
      });*/
      this.done.emit(sdwan);
    } else if (this.assignType === 'cpe') {
      const ce = new CeInventory();
      ce.ceUuid = this.selectedItem.uuid;
      ce.distribution = this.distribution; // AUTO ：全部  ASSIGN ：指定
      if (this.distribution === 'ASSIGN') {
        const vpeUuids = [];
        this.emitVpe.forEach((item) => {
          vpeUuids.push(item.uuid);
        });
        ce.vpeUuids = vpeUuids;
      }
      /*this.ceService.assignVpe(ce, () => {
        this.done.emit();
      });*/
      this.done.emit(ce);
    }
    this.dialogOptions.visible = false;
  }

}
