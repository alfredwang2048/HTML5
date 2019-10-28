import {
  Component, OnInit, OnDestroy,
  Input, Output, EventEmitter, Renderer2, ElementRef, OnChanges, SimpleChanges
} from '@angular/core';
import { modalAnimation } from '../animation';
@Component({
  selector: 'app-right-modal',
  templateUrl: './right-modal.component.html',
  styleUrls: ['./right-modal.component.styl'],
  animations: [ modalAnimation ]
})
export class RightModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  width: string|number = '300px';
  @Input()
  title: string;
  @Input()
  titleIcon: string;
  @Input()
  toggle = false;
  @Output()
  toggleChange: EventEmitter<boolean> = new EventEmitter();
  globalFunc: Function;
  modalElement: Element;
  iconContent: string;
  constructor(private renderer: Renderer2, private elementRef: ElementRef) {
  }

  ngOnInit() {
    this.modalElement = this.renderer.createElement('div');
    this.renderer.addClass(this.modalElement, 'shade');
    this.renderer.setStyle(this.modalElement, 'display', this.toggle ? 'block' : 'none');
    this.renderer.listen(this.modalElement, 'click', () => {
      this.closeModal();
    });
    const parentNode = this.renderer.parentNode(this.elementRef.nativeElement);
    this.renderer.appendChild(parentNode, this.modalElement);
    if (this.titleIcon) {
      this.iconContent = '<span class="iconfont rightTitleIcon ' + this.titleIcon + '"></span>';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggle) {
      this.toggle = changes.toggle.currentValue;
      if (this.modalElement) {
        this.renderer.setStyle(this.modalElement, 'display', this.toggle ? 'block' : 'none');
      }
    }
    if (changes.titleIcon) {
      this.iconContent = '<span class="iconfont rightTitleIcon ' + changes.titleIcon.currentValue + '"></span>';
    }
  }
  closeModal() {
    this.toggle = false;
    this.toggleChange.emit(this.toggle);
  }
  ngOnDestroy() {
    if (this.globalFunc) {
      this.globalFunc();
    }
    if (this.modalElement) {
      this.modalElement.parentNode.removeChild(this.modalElement);
    }
  }
}
