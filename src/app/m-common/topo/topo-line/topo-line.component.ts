import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  ViewChild,
  ElementRef
} from '@angular/core';
import { NodeModel } from '../topo-node/topo-node.component';

@Component({
  selector: 'app-topo-line',
  templateUrl: './topo-line.component.html',
  styleUrls: ['./topo-line.component.styl']
})
export class TopoLineComponent implements OnInit, AfterViewInit {
  @Input()
  model: LinkModel;
  @ViewChild('canvas')
  canvasRef: ElementRef;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  left = 0;
  top = 0;
  imgWidth = 45;
  imgHeight = 45;
  textTop = 2;
  textLeft = 2;
  fontSize = 12;
  private pointA;
  private pointB;
  private width: number;
  private height: number;
  private direction;
  constructor() { }

  ngOnInit() {
    this.initLine();
  }
  initLine() {
    // 线段两点
    this.direction = this.model.nodeAModel.x < this.model.nodeBModel.x ? 'left' : 'right';
    this.pointA = {
      x: this.model.nodeAModel.x + (this.direction === 'left' ? this.imgWidth : 0),
      y: this.model.nodeAModel.y + this.imgHeight / 2
    };
    this.pointB = {
      x: this.model.nodeBModel.x + (this.direction === 'left' ? 0 : this.imgWidth),
      y: this.model.nodeBModel.y + this.imgHeight / 2
    };
    // canvas 宽高
    this.width = Math.max(Math.abs(this.pointA.x - this.pointB.x), 2);
    this.height = Math.max(Math.abs(this.pointA.y - this.pointB.y), 2);
    this.left = Math.min(this.pointA.x, this.pointB.x);
    this.top = Math.min(this.pointA.y, this.pointB.y);
    if (this.model.type === 'fold') {
      this.textLeft = Math.abs(this.pointA.x - this.pointB.x) / 2;
      this.textTop = Math.abs(this.pointB.y - this.pointA.y) / 2;
    }else {
      this.textTop = (this.height - this.fontSize) / 2;
      this.textLeft = (this.width - this.model.name.length * this.fontSize) / 2;
    }
  }
  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.context = this.canvas.getContext('2d');
    this.draw();
  }
  draw(reset = false) {
    if (reset) {
      this.initLine();
    }
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.save();
    this.context.strokeStyle = this.model.lineColor || '#000';
    this.context.lineWidth = 2;
    this.context.beginPath();
    if (this.model.dash) {
      this.context.setLineDash([5, 5]);
    }
    const pointA = {
      x: this.pointA.x - this.left,
      y: this.pointA.y - this.top
    }, pointB = {
      x: this.pointB.x - this.left,
      y: this.pointB.y - this.top
    };
    if (this.model.type === 'fold') {
      const md1 = {
        x: Math.abs(pointB.x - pointA.x) / 2,
        y: pointA.y
      }, md2 = {
        x: Math.abs(pointB.x - pointA.x) / 2,
        y: pointB.y
      };
      this.context.moveTo(pointA.x, pointA.y);
      if (pointB.x !== pointA.x) {
        this.context.lineTo(md1.x, md1.y);
        this.context.lineTo(md2.x, md2.y);
      }
      this.context.lineTo(pointB.x, pointB.y);
    }else {
      this.context.moveTo(pointA.x, pointA.y);
      this.context.lineTo(pointB.x, pointB.y);
    }
    this.context.stroke();
    this.context.restore();
  }
}

export class LinkModel {
  name: string;
  dash?: boolean;
  type?: string;
  color?: string;
  lineColor?: string;
  nodeAModel: NodeModel;
  nodeBModel: NodeModel;
}
