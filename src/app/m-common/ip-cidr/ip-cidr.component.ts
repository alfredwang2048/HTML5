import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {BtnGroupComponent} from '../btn-group/btn-group.component';

@Component({
  selector: 'app-ip-cidr',
  templateUrl: './ip-cidr.component.html',
  styleUrls: ['./ip-cidr.component.styl'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IpCidrComponent),
    multi: true
  }],
})
export class IpCidrComponent implements OnInit, ControlValueAccessor {
  @Input()
    modelName = '';
  @Output()
    modelChange: EventEmitter<string | number> = new EventEmitter();
  @Input()
    model: string;
  ipCidrForm: FormGroup;
  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.ipCidrForm = this.fb.group({
      number1: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      number2: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      number3: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      number4: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
      number5: ['', [Validators.required, Validators.pattern('^([0-9]|[1-9]\\d+)$')]],
    });
  }

  get number1() {
    return this.ipCidrForm.get('number1');
  }

  get number2() {
    return this.ipCidrForm.get('number1');
  }

  get number3() {
    return this.ipCidrForm.get('number1');
  }

  get number4() {
    return this.ipCidrForm.get('number1');
  }

  get number5() {
    return this.ipCidrForm.get('number1');
  }

  writeValue(value) {
    if (value) {
      this.model = value;
    }else {
      this.model = null;
    }
  }

  registerOnChange(fn) {
    this.controlChange = fn;
  }
  registerOnTouched(fn) {
    this.touchedChange = fn;
  }
  private controlChange: Function = () => {};
  private touchedChange: Function = () => {};
}
