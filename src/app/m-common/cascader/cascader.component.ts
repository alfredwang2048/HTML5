import { Component, OnInit, OnDestroy, Input, DoCheck,
  Output, EventEmitter, Renderer2, forwardRef, KeyValueDiffers, KeyValueDiffer } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {ProxyDocumentService} from '../proxy-document.service';
@Component({
  selector: 'app-cascader',
  templateUrl: './cascader.component.html',
  styleUrls: ['./cascader.component.styl'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CascaderComponent),
    multi: true
  }]
})
export class CascaderComponent implements OnInit, DoCheck,
  OnDestroy, ControlValueAccessor {
  @Input()
  options: Options;
  @Input()
  placeholder = '请选择...';
  @Input()
  clearable = true;
  @Input()
  model: string;
  @Output()
  modelChange: EventEmitter<string> = new EventEmitter();
  @Output()
  labelChange: EventEmitter<string> = new EventEmitter();
  @Output()
  clear: EventEmitter<null> = new EventEmitter();
  menuVisible = false;
  timer: any;
  get showClear() {
    return this.clearable && this.currentLabel;
  }
  @Input()
  currentLabel = '';
  steps: any[];
  globalFunc: Function;
  uuid = Math.random().toString(16).slice(2, 8);
  private differ: KeyValueDiffer<any, any>;
  constructor(private renderer: Renderer2, private differs: KeyValueDiffers, private proxyDoc: ProxyDocumentService) { }
  initSteps() {
    this.steps = [];
    const step1 = {
      title: this.options.title,
      model: this.options.model.map(m => Object.assign(m, {active: false})),
      click: this.options.click
    };
    this.steps.push(step1);
  }
  ngOnInit() {
    this.differ = this.differs.find(this.options).create();
    this.proxyDoc.addComponent('cascader', this);
    this.initSteps();
    this.timer = setTimeout(() => {
      const change = this.differ.diff(this.options);
      clearTimeout(this.timer);
      if (change) {
        this.initSteps();
      }
    }, 80);
  }
  ngDoCheck() {
    if (this.differ && this.differ.diff(this.options)) {
      this.initSteps();
    }
  }
  ngOnDestroy() {
    if (this.globalFunc) {
      this.globalFunc();
    }
    this.proxyDoc.deleteComponent('cascader', this.uuid);
    clearTimeout(this.timer);
  }
  clearValue(e?: Event) {
    if (e) {
      e.stopPropagation();
    }
    this.currentLabel = '';
    this.model = '';
    this.modelChange.emit('');
    this.controlChange('');
    this.clear.emit();
  }
  changeLabels() {
    const next = [];
    this.steps.forEach((item) => {
      const steps = item.model.filter((m) => m.active);
      next.push(steps[0]);
    });
    const nextLabels = next.map((option) => option.label);
    const nextValues = next.map((option) => option.value);
    this.currentLabel = nextLabels[nextLabels.length - 1];
    this.model = nextValues[nextValues.length - 1];
    this.modelChange.emit(this.model);
    this.controlChange(this.model);
  }
  clickMenuHandler(e) {
    e.stopPropagation();
  }
  toggleHandler(e: MouseEvent) {
    e.stopPropagation();
    this.menuVisible = !this.menuVisible;
    if (this.menuVisible) {
      if (!this.globalFunc) {
        this.globalFunc = this.renderer.listen('document', 'click', () => {
          this.menuVisible = false;
        });
      }
    }else {
      if (this.globalFunc) {
        this.globalFunc();
      }
    }
  }
  selectHandler(step: number, index: number) {
    this.steps = this.steps.slice(0, step + 1);
    const clickFunc = this.steps[step].click;
    this.steps[step].model.forEach((m, i) => {
      m.active = i === index;
    });
    const current = this.steps[step].model[index];
    if (clickFunc) {
      clickFunc(current, () => {
        const nextStep = current.children;
        if (nextStep) {
          if (nextStep && Array.isArray(nextStep.model)) {
            nextStep.model.forEach((m) => {
              m.active = false;
            });
            if (this.steps.length - 1 === step) {
              this.steps.push(nextStep);
            }
          }
        }else {
          this.changeLabels();
          this.menuVisible = false;
        }
      });
    }else {
      if (!current.children) {
        this.changeLabels();
        this.menuVisible = false;
      }
    }
  }
  inputHandler(label: string) {
    this.currentLabel = label;
    this.labelChange.emit(label);
  }
  writeValue(val: any) {
    if (val) {
      this.model = val;
      this.modelChange.emit(val);
    }else {
      this.currentLabel = '';
      this.model = '';
      this.modelChange.emit('');
      this.initSteps();
    }
  }
  registerOnChange(fn: Function) {
    this.controlChange = fn;
  }
  registerOnTouched(fn: Function) {
    this.controlTouch = fn;
  }
  private controlChange: Function = (val: any) => {};
  private controlTouch: Function = (val: any) => {};
}
export interface Options {
  title?: string;
  model: Array<OptionModel>;
  click?: (model: OptionModel) => void;
}
export interface OptionModel {
  label?: string;
  value: string;
  children?: Options;
}
