import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {SdwanInventory, VpeService} from '../../../shared/sdwan/';
import {QueryObject} from '../../../base/api';
import {CeService} from '../../../shared/sdwan/ce.service';
import {SdwanService} from '../../../shared/sdwan';

@Component({
  selector: 'app-appoint-vpe',
  templateUrl: './appoint-vpe.component.html',
  styleUrls: ['./appoint-vpe.component.styl']
})
export class AppointVpeComponent implements OnInit {

  dialogOptions = {
    title: '指定VPE',
    width: '600px',
    visible: false
  };

  public allVpe: Array<any>;
  public selectVpeUuid;
  public emitVpe;
  public tips;

  @Input()
  selectVpe: any;
  @Input()
  assignType: string;
  @Input()
  selectedItem: any;
  @Output()
  done: EventEmitter<null> = new EventEmitter();

  constructor(private vpeServer: VpeService, private ceService: CeService, private sdServer: SdwanService) {
  }

  ngOnInit() {
  }

  open() {
    this.reset();

    if (this.assignType === 'network') {
      /*查询所有VPE*/
      const qobj = new QueryObject();
      this.vpeServer.query(qobj, (vpes, total) => {
        this.allVpe = vpes;
        /*查询已被指定的VPE*/
        if (this.allVpe.length) {
          this.vpeServer.getUsedVpes(this.selectedItem.uuid, (usedVpes) => {
              if (usedVpes.length) {
                usedVpes.forEach((item) => {
                  for (let i = 0; i < this.allVpe.length; i++) {
                    if (item.uuid === this.allVpe[i].uuid) {
                      this.selectVpeUuid[item.uuid] = true;
                      this.allVpe[i]['disabled'] = true;
                      break;
                    }
                  }
                });
              }
              if (this.selectVpe.length) {
                this.selectVpe.forEach((item) => {
                  for (let i = 0; i < this.allVpe.length; i++) {
                    if (item.uuid === this.allVpe[i].uuid) {
                      this.selectVpeUuid[item.uuid] = true;
                      break;
                    }
                  }
                });
              }
              for (const key in this.selectVpeUuid) {
                this.allVpe.forEach((item) => {
                  if (key === item.uuid) {
                    this.emitVpe.push(item);
                  }
                });
              }
            });
        }
        this.dialogOptions.visible = true;
      });
    } else if (this.assignType === 'cpe') {
      /*查询所有VPE*/
      if (this.selectedItem.sdwanNetworkDistribution === 'ASSIGN') {
        const sdwan = new SdwanInventory();
        sdwan.uuid = this.selectedItem.sdwanNetworkUuid;
        this.sdServer.getListVpeForSdwan(sdwan, (list) => {
          this.allVpe = list;
          /*查询已被指定的VPE*/
          this.ceService.getUsedVpes(this.selectedItem.uuid, (usedVpes) => {
            if (usedVpes.length) {
              usedVpes.forEach((item) => {
                for (let i = 0; i < this.allVpe.length; i++) {
                  if (item.uuid === this.allVpe[i].uuid) {
                    this.selectVpeUuid[item.uuid] = true;
                    this.allVpe[i]['disabled'] = true;
                    break;
                  }
                }
              });
            }
            if (this.selectVpe.length) {
              this.selectVpe.forEach((item) => {
                for (let i = 0; i < this.allVpe.length; i++) {
                  if (item.uuid === this.allVpe[i].uuid) {
                    this.selectVpeUuid[item.uuid] = true;
                    break;
                  }
                }
              });
            }
            for (const key in this.selectVpeUuid) {
              this.allVpe.forEach((item) => {
                if (key === item.uuid) {
                  this.emitVpe.push(item);
                }
              });
            }
          });
          this.dialogOptions.visible = true;
        });
      }else {
        const qobj = new QueryObject();
        this.vpeServer.query(qobj, (vpes, total) => {
          this.allVpe = vpes;
          /*查询已被指定的VPE*/
          this.ceService.getUsedVpes(this.selectedItem.uuid, (usedVpes) => {
            if (usedVpes.length) {
              usedVpes.forEach((item) => {
                for (let i = 0; i < this.allVpe.length; i++) {
                  if (item.uuid === this.allVpe[i].uuid) {
                    this.selectVpeUuid[item.uuid] = true;
                    this.allVpe[i]['disabled'] = true;
                    break;
                  }
                }
              });
            }
            if (this.selectVpe.length) {
              this.selectVpe.forEach((item) => {
                for (let i = 0; i < this.allVpe.length; i++) {
                  if (item.uuid === this.allVpe[i].uuid) {
                    this.selectVpeUuid[item.uuid] = true;
                    break;
                  }
                }
              });
            }
            for (const key in this.selectVpeUuid) {
              this.allVpe.forEach((item) => {
                if (key === item.uuid) {
                  this.emitVpe.push(item);
                }
              });
            }
          });
          this.dialogOptions.visible = true;
        });
      }
    }
  }

  reset() {
    this.emitVpe = [];
    this.selectVpeUuid = {};
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

  cancel() {
    this.dialogOptions.visible = false;
  }

  confirm() {
    if (this.emitVpe.length < 1) {
      this.tips = '请选择VPE';
    } else {
      this.done.emit(this.emitVpe);
      this.dialogOptions.visible = false;
    }
  }

}
