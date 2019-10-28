import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  Renderer2,
  ViewChild,
  ElementRef } from '@angular/core';
@Component({
  selector: 'app-topo-node',
  templateUrl: './topo-node.component.html',
  styleUrls: ['./topo-node.component.styl']
})
export class TopoNodeComponent implements OnInit {
  @Input()
  model: NodeModel;
  @Output()
  modelChange: EventEmitter<NodeModel> = new EventEmitter();
  @Input()
  maxWidth: number;
  @Input()
  maxHeight: number;
  @Output()
  clickHandler: EventEmitter<NodeModel> = new EventEmitter();
  width = 50;
  height = 45;
  fontColor = '#36ab60';
  cursor = 'pointer';
  tipLeft: number;
  tipTop: number;
  showTip = false;
  moveTip = false;
  private originX = 0;
  private originY = 0;
  @ViewChild('nodeWrapper')
  nodeRef: ElementRef;
  constructor(private renderer: Renderer2) { }

  ngOnInit() {
    this.originX = this.model.x;
    this.originY = this.model.y;
    let startPageX, startPageY;
    this.renderer.listen(this.nodeRef.nativeElement, 'dragstart', (event) => {
        startPageX = event.pageX;
        startPageY = event.pageY;
      this.originX = this.model.x;
      this.originY = this.model.y;
    });
    this.renderer.listen(this.nodeRef.nativeElement, 'dragend', (ev) => {
      const maxDistanceX = this.maxWidth - this.width,
        maxDistanceY = this.maxHeight - this.height,
        curDistanceX = this.originX + (ev.pageX - startPageX),
        curDistanceY = this.originY + (ev.pageY - startPageY);
      if (curDistanceX < 0) {
        this.model.x = 0;
      }else if (curDistanceX > maxDistanceX) {
        this.model.x = maxDistanceX;
      }else {
        this.model.x = curDistanceX;
      }
      if (curDistanceY < 0) {
        this.model.y = 0;
      }else if (curDistanceY > maxDistanceY) {
        this.model.y = maxDistanceY;
      }else {
        this.model.y = curDistanceY;
      }
      let left = this.model.x + this.width - 5,
        top = this.model.y + this.height - 5;
      if (left + 200 > this.maxWidth) {
        left = this.maxWidth - 205;
      }
      if (top + 125 > this.maxHeight) {
        top = this.maxHeight - 125;
      }
      this.tipLeft = left;
      this.tipTop = top;
      this.modelChange.emit(this.model);
      this.originX = this.model.x;
      this.originY = this.model.y;
    });
    this.renderer.listen(this.nodeRef.nativeElement, 'click', () => {
      this.clickHandler.emit(this.model);
    });
  }
  enterHandler() {
    if (!this.moveTip) {
      let left = this.model.x + this.width - 5,
        top = this.model.y + this.height - 5;
      if (left + 200 > this.maxWidth) {
        left = this.maxWidth - 205;
      }
      if (top + 125 > this.maxHeight) {
        top = this.maxHeight - 125;
      }
      this.tipLeft = left;
      this.tipTop = top;
      this.showTip = true;
    }
  }
  leaveHandler() {
    if (!this.moveTip) {
      this.showTip = false;
    }
  }
  parentMove(dx, dy) {
    this.model.x = this.originX + dx;
    this.model.y = this.originY + dy;
  }
  parentUp() {
    this.originX = this.model.x;
    this.originY = this.model.y;
  }
}
export interface NodeModel {
  uuid: string;
  name: string;
  x?: number;
  y?: number;
  color?: string;
  iconClass: string;
  topoType: string;
  ceMasterIp?: string;
  city?: string;
  bandwidthOfferingUuid?: string;
  popInfos?: any;
  [propName: string]: any;
}
