import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  KeyValueDiffers,
  DoCheck,
  ViewChild,
  ViewChildren,
  ElementRef,
  Renderer2,
  QueryList
} from '@angular/core';
import { NodeModel, TopoNodeComponent } from './topo-node/topo-node.component';
import { LinkModel, TopoLineComponent } from './topo-line/topo-line.component';
import { ContainerModel, TopoContainerComponent } from './topo-container/topo-container.component';

@Component({
  selector: 'app-topo',
  templateUrl: './topo.component.html',
  styleUrls: ['./topo.component.styl']
})
export class TopoComponent implements OnInit, DoCheck {
  @Input()
  model: TopoModel;
  maxWidth: number;
  maxHeight: number;
  @ViewChild('topoWrapper')
  wrapper: ElementRef;
  @Output()
  nodeClick: EventEmitter<NodeModel> = new EventEmitter();
  @ViewChildren(TopoLineComponent)
  lineRefs: QueryList<TopoLineComponent>;
  @ViewChildren(TopoNodeComponent)
  nodeRefs: QueryList<TopoNodeComponent>;
  @ViewChildren(TopoContainerComponent)
  containerRefs: QueryList<TopoContainerComponent>;
  private modelDiffer;
  constructor(private differs: KeyValueDiffers, private renderer: Renderer2) {
    this.modelDiffer = differs.find({}).create();
  }

  ngOnInit() {
    this.maxWidth = this.wrapper.nativeElement.offsetWidth;
    this.maxHeight = this.wrapper.nativeElement.offsetHeight;
    this.renderer.listen('window', 'resize', () => {
      this.maxWidth = this.wrapper.nativeElement.offsetWidth;
      this.maxHeight = this.wrapper.nativeElement.offsetHeight;
      this.calc();
      this.lineRefs.forEach(lineRef => lineRef.draw(true));
      this.containerRefs.forEach(con => con.draw());
    });
  }
  ngDoCheck() {
    const change = this.modelDiffer.diff(this.model);
    if (change) {
      this.calc();
    }
  }
  calc() {
    const circleX = this.maxWidth / 2,
      circleY = this.maxHeight / 2,
      maxR = Math.min(circleX, circleY) - 60,
      midR = Math.min(circleX, circleY) - 160,
      minR = Math.min(circleX, circleY) - 220,
      startAngle = Math.PI;
    if (this.model.nodes) {
      const outNodes = [],
        inNodes = [];
      this.model.nodes.forEach(node => {
        if (node.topoType === 'out') {
          outNodes.push(node);
        }else {
          inNodes.push(node);
        }
      });
      if (inNodes.length) {
        const inNodeLength = inNodes.length;
        const ang = 2 * Math.PI / inNodeLength;
        inNodes.forEach((node, index) => {
          node.x = circleX + minR * Math.cos(index * ang);
          node.y = circleY + minR * Math.sin(index * ang);
          const startAng = index * ang - ang / 2 + Math.PI / 18,
            half = index > inNodeLength / 2 ? index - inNodeLength / 2 : index + inNodeLength / 2,
            masterArr = [],
            leftMasterArr = [],
            rightMasterArr = [],
            singleArr = [];
          for (let i = 0; i < outNodes.length; i++) {
            // 处理主备都存在
            if ((outNodes[i].popInfos[0].haType === 'Master' &&
              outNodes[i].popInfos[1].vpeUuid &&
              outNodes[i].popInfos[0].vpeUuid === node.uuid)
              || (outNodes[i].popInfos[1].haType === 'Master' &&
              outNodes[i].popInfos[0].vpeUuid &&
              outNodes[i].popInfos[1].vpeUuid === node.uuid)) {
              outNodes[i].sort = outNodes[i].slaveVpeIndex < half ? (outNodes[i].slaveVpeIndex + inNodeLength) : outNodes[i].slaveVpeIndex;
              masterArr.push(outNodes[i]);
            }
            // 处理主备只有一个存在
            if ((!outNodes[i].popInfos[1].vpeUuid &&
              outNodes[i].popInfos[0].vpeUuid === node.uuid)
              || (outNodes[i].popInfos[1].vpeUuid &&
              !outNodes[i].popInfos[0].vpeUuid &&
              outNodes[i].popInfos[1].vpeUuid === node.uuid)
              || (!outNodes[i].popInfos[0].vpeUuid &&
              outNodes[i].popInfos[1].vpeUuid === node.uuid)
              || (!outNodes[i].popInfos[1].vpeUuid &&
              outNodes[i].popInfos[0].vpeUuid === node.uuid)) {
              singleArr.push(outNodes[i]);
            }
          }
          masterArr.sort((a, b) => {
            return a.sort - b.sort;
          });
          masterArr.forEach((ms, i) => {
            if (ms.sort < index) {
              leftMasterArr.push(ms);
            }else {
              rightMasterArr.push(ms);
            }
          });
          leftMasterArr.forEach((leftCe, i) => {
            leftCe.x = circleX + maxR * Math.cos(startAng - i * ang / (2 * leftMasterArr.length));
            leftCe.y = circleY + maxR * Math.sin(startAng - i * ang / (2 * leftMasterArr.length));
          });
          rightMasterArr.forEach((rightCe, i) => {
            rightCe.x = circleX + maxR * Math.cos(startAng + ang / 2 - i * ang / (2 * rightMasterArr.length));
            rightCe.y = circleY + maxR * Math.sin(startAng  + ang / 2 - i * ang / (2 * rightMasterArr.length));
          });
          singleArr.forEach((single, i) => {
            single.x = circleX + midR * Math.cos(startAng + ang - i * ang / singleArr.length);
            single.y = circleY + midR * Math.sin(startAng + ang - i * ang / singleArr.length);
          });
        });
        let tunnelIndex = 0;
        outNodes.forEach(node => {
          if (!node.popInfos[0].vpeUuid && !node.popInfos[1].vpeUuid) {
            node.x = 20;
            node.y = 20 + tunnelIndex * 80;
            tunnelIndex ++;
          }
        });
      }else {
        outNodes.forEach((node, index) => {
          node.x = circleX + maxR * Math.cos(startAngle + index * 2 * Math.PI / outNodes.length);
          node.y = circleY + maxR * Math.sin(startAngle + index * 2 * Math.PI / outNodes.length);
        });
      }
    }
  }
  nodeMove(node: NodeModel) {
    this.lineRefs.forEach(lineRef => {
      if (lineRef.model.nodeAModel.uuid === node.uuid) {
        lineRef.draw(true);
      }else if (lineRef.model.nodeBModel.uuid === node.uuid) {
        lineRef.draw(true);
      }
    });
    this.containerRefs.forEach(conRef => {
      const nodeModels = conRef.model.nodeModels;
      for (let i = 0; i < nodeModels.length; i++) {
        if (nodeModels[i].uuid === node.uuid) {
          conRef.draw();
          break;
        }
      }
    });
  }
  containerMove(ev) {
    ev.container.nodeModels.forEach(nodeModel => {
      this.nodeRefs.forEach(node => {
        if (node.model.uuid === nodeModel.uuid) {
          node.parentMove(ev.dx, ev.dy);
          this.lineRefs.forEach(lineRef => {
            if (lineRef.model.nodeAModel.uuid === nodeModel.uuid) {
              lineRef.draw(true);
            }else if (lineRef.model.nodeBModel.uuid === nodeModel.uuid) {
              lineRef.draw(true);
            }
          });
        }
      });
    });
  }
  containerUp(con: ContainerModel) {
    con.nodeModels.forEach(nodeModel => {
      this.nodeRefs.forEach(node => {
        if (node.model.uuid === nodeModel.uuid) {
          node.parentUp();
        }
      });
    });
  }
  nodeClickHandler(node: NodeModel) {
    this.nodeClick.emit(node);
  }
}
export class TopoModel {
  nodes?: Array<NodeModel>;
  links?: Array<LinkModel>;
  containers?: Array<ContainerModel>;
}
