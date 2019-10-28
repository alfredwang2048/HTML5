import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  EventEmitter,
  Renderer2
} from '@angular/core';
import { NodeModel } from '../topo-node/topo-node.component';
@Component({
  selector: 'app-topo-container',
  templateUrl: './topo-container.component.html',
  styleUrls: ['./topo-container.component.styl']
})
export class TopoContainerComponent implements OnInit, AfterViewInit {
  @Input()
  model: ContainerModel;
  @Output()
  moveHandler: EventEmitter<{dx: number, dy: number, container: ContainerModel}> = new EventEmitter();
  @Output()
  upHandler: EventEmitter<ContainerModel> = new EventEmitter();
  @ViewChild('canvas')
  canvasRef: ElementRef;
  @Input()
  maxWidth: number;
  @Input()
  maxHeight: number;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  strokeStyle = '#00c1e0';
  dropble = false;
  top = 0;
  left = 0;
  width = 0;
  height = 0;
  private imgWidth = 45;
  private imgHeight = 45;
  private originX = 0;
  private originY = 0;
  private minWidth = 250;
  private minHeight = 250;
  constructor(private renderer: Renderer2) { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.context = this.canvas.getContext('2d');
    const canvasParent = this.renderer.parentNode(this.canvas);
    this.draw();
    this.renderer.listen(canvasParent, 'mousedown', (event) => {
      const startPageX = event.pageX,
        startPageY = event.pageY;
      this.originX = this.left;
      this.originY = this.top;
      this.dropble = true;
      this.renderer.listen('document', 'mousemove', (ev) => {
        if (this.dropble) {
          const maxDistanceX = this.maxWidth - this.width - this.imgWidth / 2,
            maxDistanceY = this.maxHeight - this.height - this.imgHeight / 2,
            curDistanceX = this.originX + (ev.pageX - startPageX),
            curDistanceY = this.originY + (ev.pageY - startPageY);
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
          this.moveHandler.emit({dx: this.left - this.originX, dy: this.top - this.originY, container: this.model});
        }
      });
      this.renderer.listen('document', 'mouseup', (e) => {
        this.dropble = false;
        this.originX = this.left;
        this.originY = this.top;
        this.upHandler.emit(this.model);
      });
    });
  }
  draw() {
    if (this.model.nodeModels.length) {
      let minLeft = Number.MAX_SAFE_INTEGER,
        maxRight = Number.MIN_SAFE_INTEGER,
        minTop = Number.MAX_SAFE_INTEGER,
        maxBottom = Number.MIN_SAFE_INTEGER;
      this.model.nodeModels.forEach(node => {
        if (node.x < minLeft) {
          minLeft = node.x;
        }
        if (node.x > maxRight) {
          maxRight = node.x + this.imgWidth;
        }
        if (node.y < minTop) {
          minTop = node.y;
        }
        if (node.y > maxBottom) {
          maxBottom = node.y + this.imgHeight;
        }
      });
      const width = this.canvas.width = this.model.nodeModels.length > 1 ? (this.model.nodeModels.length > 2 ? maxRight - minLeft : Math.max(maxRight - minLeft, maxBottom - minTop))  : this.minWidth;
      const height = this.canvas.height = this.model.nodeModels.length > 1 ? (this.model.nodeModels.length > 2 ? maxBottom - minTop : Math.max(maxRight - minLeft, maxBottom - minTop)) : this.minHeight;
      const timer = setTimeout(() => {
        this.top = this.model.nodeModels.length > 2 ? minTop : minTop - width / 2;
        this.left = minLeft;
        this.width = width;
        this.height = height;
        clearTimeout(timer);
      }, 0);
      this.context.save();
      this.context.beginPath();
      this.context.strokeStyle = this.strokeStyle;
      this.context.fillStyle = this.model.color;
      this.context.clearRect(0, 0, width, height);
      if (this.model.type === 'rect') {
        this.context.rect(0, 0, width, height);
      }else if (this.model.type === 'circle') {
        const startX = width / 2,
          startY = height / 2;
        this.context.beginPath();
        this.context.moveTo(startX + width / 2 - 1, startY);
        for (let i = 0.01; i < 2 * Math.PI; i = i + 0.01) {
          this.context.lineTo(startX + (width / 2 - 1) * Math.cos(i), startY + (height / 2 - 1) * Math.sin(i));
        }
      }else {
        this.context.rect(0, 0, width, height);
      }
      this.context.stroke();
      this.context.closePath();
      this.context.restore();
    }
  }
}

export class ContainerModel {
  iconClass: string;
  type?: string;
  color?: string;
  nodeModels: Array<NodeModel>;
}
