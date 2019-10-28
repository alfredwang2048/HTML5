import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MCommonModule} from '../m-common/m-common.module';
export function getDocument(): any {
  return document;
}

export function getWindow(): any {
  return window;
}

@NgModule({
  imports: [
    CommonModule,
    MCommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [],
  exports: [],
  entryComponents: []
})
export class SharedModule {
  constructor() {
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
      ]
    };
  }
}
