import { Component,
  OnInit,
  AfterContentInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  Renderer2,
  ElementRef } from '@angular/core';
import { WindowService } from '../../shared/window.service';
import { dialogAnimation } from '../animation';
import { ProxyDocumentService } from '../proxy-document.service';
@Component({
  selector: 'app-w-dialog',
  templateUrl: './w-dialog.component.html',
  styleUrls: ['./w-dialog.component.styl'],
  animations: [dialogAnimation]
})
export class WDialogComponent implements OnInit,
  AfterContentInit,
  OnChanges,
  OnDestroy {
  @Input()
  title: string;
  @Input()
  width: string;
  @Input()
  changeHeight: number;
  @Input()
  height: string;
  @Input()
  top: string;
  @Input()
  visible = false;
  @Output()
  visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input('close-on-click-modal')
  closeOnClickModal = false;
  @Input('close-on-press-esc')
  closeOnPressEsc = false;
  @Input()
    zIndex;
  @ViewChild('dialog') dialogEle: ElementRef;
  globalListenFunc: Function;
  dialogStyle: DialogStyle;
  constructor(private renderer: Renderer2,
              private window: WindowService,
              public proxyDoc: ProxyDocumentService) {
  }

  ngOnInit() {
    this.getDialogStyle();
    if (this.closeOnPressEsc) {
      this.globalListenFunc = this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
        if (this.visible && event.keyCode === 27) {
          this.closeDialog();
        }
      });
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (!changes) {
      return;
    }
    if (changes.changeHeight && !changes.changeHeight.isFirstChange()) {
     this.centerDialog();
    }
    if (changes.visible) {
      this.visible = changes.visible.currentValue;
    }
    if (changes.width) {
      this.getDialogStyle();
    }
  }
  ngAfterContentInit() {
    this.centerDialog();
  }
  centerDialog() {
    if (this.top === undefined) {
      const dialogEle = this.dialogEle.nativeElement;
      const height = this.height || this.window.getComputedStyle(dialogEle).height;
      const marginTop = (-parseFloat(height) / 2) + 'px';
      this.renderer.setStyle(dialogEle, 'margin-top', marginTop);
    }
  }
  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
  clickWrapper() {
    this.proxyDoc.closeComponent();
    if (this.closeOnClickModal) {
      this.closeDialog();
    }
  }
  getDialogStyle() {
    this.dialogStyle = new DialogStyle();
    this.dialogStyle.top = this.top;
    if (this.width) {
      this.dialogStyle.width = this.width;
      this.dialogStyle.marginLeft = (-parseFloat(this.width) / 2) + 'px';
    }
  }
  ngOnDestroy() {
    if (this.globalListenFunc) {
      this.globalListenFunc();
    }
  }
}
class DialogStyle {
  top?: string;
  marginLeft?: string;
  marginTop?: string;
  width?: string;
}

export class DialogOptions {
  title: string;
  width: string;
  top: string;
  visible: boolean;
  changeHeight?: number;
}
