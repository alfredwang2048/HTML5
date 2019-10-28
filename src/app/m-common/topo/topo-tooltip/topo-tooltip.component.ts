import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ViewChild,
  Renderer2
} from '@angular/core';
import { NodeModel } from '../topo-node/topo-node.component';
import { CeService, VpePopInfoInventory } from '../../../shared/sdwan';
import { QueryObject } from '../../../base/api';

@Component({
  selector: 'app-topo-tooltip',
  templateUrl: './topo-tooltip.component.html',
  styleUrls: ['./topo-tooltip.component.styl']
})
export class TopoTooltipComponent implements OnInit, OnChanges {
  @Input()
  model: NodeModel;
  @Input()
  left: number;
  @Input()
  top: number;
  @Input()
  move: boolean;
  @Input()
  maxWidth: number;
  @Input()
  maxHeight: number;
  @Output()
  moveChange: EventEmitter<boolean> = new EventEmitter();
  @Input()
  show: boolean;
  @Output()
  showChange: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('wrapper')
  wrapperRef: ElementRef;
  private originLeft: number;
  private originTop: number;
  private globalMoveFn: () => void;
  private timer: any;
  popInfo: VpePopInfoInventory;
  @HostListener('mouseenter') onEnterHandler = () => {
    if (!this.show) {
      this.show = true;
      this.showChange.emit(this.show);
    }
  }
  @HostListener('mouseleave') onLeaveHandler = () => {
    if (!this.move) {
      this.show = false;
      this.showChange.emit(this.show);
      this.clearTime();
    }
  }
  constructor(private renderer: Renderer2, private ceService: CeService) { }

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.left) {
      this.originLeft = this.left;
    }
    if (changes.top) {
      this.originTop = this.top;
    }
    if (changes.show && changes.show.currentValue && !changes.show.previousValue) {
      this.queryInfo();
    }
    if (changes.show && !changes.show.currentValue) {
      if (!this.move) {
        this.clearTime();
      }
    }
  }
  moveClickHandler() {
    this.move = true;
    this.moveChange.emit(this.move);
    // move 相关
    const ele = this.wrapperRef.nativeElement;
    this.globalMoveFn = this.renderer.listen(ele, 'mousedown', (event) => {
      if (this.move) {
        const startPageX = event.pageX,
          startPageY = event.pageY,
          orginLeft = this.left,
          originTop = this.top,
          width = ele.offsetWidth,
          height = ele.offsetHeight;
        const docMoveFn = this.renderer.listen('document', 'mousemove', (ev) => {
          if (this.move) {
            const maxDistanceX = this.maxWidth - width,
              maxDistanceY = this.maxHeight - height,
              curDistanceX = orginLeft + (ev.pageX - startPageX),
              curDistanceY = originTop + (ev.pageY - startPageY);
            if (curDistanceX < 0) {
              this.left = 0;
            }else if (curDistanceX > maxDistanceX) {
              this.left = maxDistanceX;
            }else {
              this.left = curDistanceX;
            }
            if (curDistanceY < 0) {
              this.top = 0;
            }else if (curDistanceY > maxDistanceY) {
              this.top = maxDistanceY;
            }else {
              this.top = curDistanceY;
            }
          }
        });
        const docUpFn = this.renderer.listen('document', 'mouseup', (e) => {
          docMoveFn();
          docUpFn();
        });
      }
    });
  }
  closeClickHandler() {
    this.move = false;
    this.moveChange.emit(this.move);
    this.show = false;
    this.showChange.emit(this.show);
    this.left = this.originLeft;
    this.top = this.originTop;
    this.globalMoveFn();
    this.clearTime();
  }
  queryInfo() {
    const qobj = new QueryObject();
    qobj.conditions = [{name: 'ceUuid', op: '=', value: this.model.uuid}];
    this.clearTime();
    this.ceService.queryPopInfo(qobj, (infos) => {
      if (infos.length) {
        this.popInfo = infos[0];
        this.popInfo.bandwidthString = sizeRoundToString(this.popInfo.bandwidth);
        this.timer = setInterval(() => {
          this.ceService.queryPopInfo(qobj, (popinfos) => {
            if (popinfos.length) {
              this.popInfo = popinfos[0];
              this.popInfo.bandwidthString = sizeRoundToString(this.popInfo.bandwidth);
            }
          });
        }, 90 * 1000);
      }
    });
  }
  clearTime() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

function sizeRoundToString(size) {
  const K = 1024;
  const sizeMap = {
    'P': K * K * K * K * K,
    'T': K * K * K * K,
    'G': K * K * K,
    'M': K * K,
    'K': K
  };
  let roundSize = '0B',
    flag = true;
  if (!size || size < K) {
    return size + 'B';
  } else {
    for (const obj in sizeMap) {
      if (size / sizeMap[obj] >= 1 && flag) {
        roundSize = (size / sizeMap[obj]).toFixed(2) + obj;
        flag = false;
      }
    }
    return roundSize;
  }
}
