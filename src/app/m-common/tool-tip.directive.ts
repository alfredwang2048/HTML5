import {
  Directive,
  ElementRef,
  Input,
  HostListener,
  Renderer2,
  OnInit,
  DoCheck,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {Observable} from 'rxjs/Observable';

@Directive({
  selector: '[appToolTip]'
})
export class ToolTipDirective implements OnInit, OnChanges {

  @Input('appToolTip') content: string;
  @Input() position = 'top';
  eleToolTip = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  ngOnInit() {
    this.appendHtml();
    setTimeout(() => {
      this.calcStyle();
    });
    this.renderer.listen('window', 'resize' , () => {
      this.calcStyle();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.content) {
      this.appendHtml();
    }
  }

  appendHtml() {
    if (this.eleToolTip) {
      this.renderer.removeChild(this.renderer.parentNode(this.el.nativeElement), this.eleToolTip);
    }
    this.renderer.setStyle(this.renderer.parentNode(this.el.nativeElement), 'position', 'relative');
    const divEle = this.renderer.createElement('div');
    this.renderer.addClass(divEle, 'tooltip');
    if (this.position === 'left') {
      this.renderer.addClass(divEle, 'left');
    }else if (this.position === 'right') {
      this.renderer.addClass(divEle, 'right');
    }
    divEle.innerHTML = (this.content !== null || this.content !== undefined || this.content !== '') ? `<div class="tooltip-arrow"></div><div class="tooltip-inner">${this.content}</div>` : '';
    this.renderer.appendChild(this.renderer.parentNode(this.el.nativeElement), divEle);
    this.eleToolTip = divEle;
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.calcStyle();
    this.renderer.setStyle(this.eleToolTip, 'display', 'block');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.eleToolTip, 'display', 'none');
  }

  calcStyle() {
    this.renderer.setStyle(this.eleToolTip, 'display', 'block');
    const eleWidth = this.el.nativeElement.getBoundingClientRect().width;
    const eleHeight = this.el.nativeElement.getBoundingClientRect().height;
    const toolTipWidth = this.eleToolTip.getBoundingClientRect().width;
    const toolTipHeight = this.eleToolTip.getBoundingClientRect().height;
    if (this.position === 'left') {
        this.renderer.setStyle(this.eleToolTip, 'left', this.el.nativeElement.offsetLeft - toolTipWidth - 5 + 'px');
        this.renderer.setStyle(this.eleToolTip, 'top', this.el.nativeElement.offsetTop + (eleHeight - toolTipHeight) / 2 + 'px');
    }else if (this.position === 'right') {
        this.renderer.setStyle(this.eleToolTip, 'left', this.el.nativeElement.offsetLeft + eleWidth + 5 + 'px');
        this.renderer.setStyle(this.eleToolTip, 'top', this.el.nativeElement.offsetTop + (eleHeight - toolTipHeight) / 2 + 'px');
    }else {
        /*this.renderer.setStyle(this.eleToolTip, 'margin-left', -(Math.abs(eleWidth - toolTipWidth) / 2) + 'px');
        this.renderer.setStyle(this.eleToolTip, 'bottom', eleHeight + 'px');*/
        this.renderer.setStyle(this.eleToolTip, 'left', this.el.nativeElement.offsetLeft + (eleWidth - toolTipWidth) / 2 + 'px');
        this.renderer.setStyle(this.eleToolTip, 'top', this.el.nativeElement.offsetTop - toolTipHeight + 'px');
    }
    this.renderer.setStyle(this.eleToolTip, 'display', 'none');
  }

}
