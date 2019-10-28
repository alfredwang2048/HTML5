import {Component, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-el-switch',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ElSwitchComponent),
    multi: true
  }],
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.styl'],
})
export class ElSwitchComponent implements OnInit, ControlValueAccessor, OnChanges {

  @Input() set disabled(val: boolean) {   // todo, is discarded.
    console.warn('Element Angular: (disabled) is discarded, use [elDisabled] replace it.');
  }
  @Input() elDisabled = false;
  @Input() name: string;
  @Input() width: number;
  @Input('active-icon-class') activeIconClass: string;
  @Input('inactive-icon-class') inactiveIconClass: string;
  @Input('active-text') activeText: string;
  @Input('inactive-text') inactiveText: string;
  @Input('active-color') activeColor = '#409EFF';
  @Input('inactive-color') inactiveColor = '#C0CCDA';

  // bind value
  @Input() set model(val: boolean) {
    this._model = val;
    this.updateStyles();
  }
  @Output() modelChange: EventEmitter<any> = new EventEmitter<any>();

  _model = false;
  hasText = false;
  realWidth: number;
  coreStyles: SafeStyle;
  iconTransform: SafeStyle;

  constructor(
    private sanitizer: DomSanitizer,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.model) {
      this._model = changes.model.currentValue;
      this.updateStyles();
    }
  }

  changeHandle(nextValue: boolean): void {
    /*this.model = nextValue;
    this.modelChange.emit(nextValue);
    this.controlChange(nextValue);*/

    if (!this.elDisabled) {
      this.model = !nextValue;
      this.modelChange.emit(!nextValue);
      this.controlChange(!nextValue);
    }
  }

  updateStyles(): void {
    let baseStyle = `width: ${this.realWidth}px;`;
    const translate = this._model ? `translate3d(${this.realWidth - 20}px, 0, 0)` : '';
    const color = this._model ? this.activeColor : this.inactiveColor;
    const colorStyles = `border-color: ${color}; background-color: ${color};`;

    this.iconTransform = this.sanitizer.bypassSecurityTrustStyle(`transform: ${translate}`);
    if (this.activeColor && this.inactiveColor) {
      baseStyle += colorStyles;
    }
    this.coreStyles = this.sanitizer.bypassSecurityTrustStyle(baseStyle);
  }

  ngOnInit(): void {
    this.realWidth = this.width ? this.width : 40;
    // this.updateStyles();
  }

  writeValue(value: any): void {
    this.model = value;
  }

  registerOnChange(fn: Function): void {
    this.controlChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.controlTouch = fn;
  }

  private controlChange: Function = () => {};
  private controlTouch: Function = () => {};

}
