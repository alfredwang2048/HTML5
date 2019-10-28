import { Injectable, ComponentRef,
  ComponentFactoryResolver, Injector,
  ApplicationRef } from '@angular/core';
import { DocumentService } from './document.service';
@Injectable()
export class DynamicGenerateService {

  constructor(private document: DocumentService,
              private factory: ComponentFactoryResolver,
              private injector: Injector,
              private appRef: ApplicationRef) { }
  generator(Component: any): ComponentRef<any> {
    const id = this.makeID();
    const component: ComponentRef<any> = this.factory.resolveComponentFactory(Component)
      .create(this.injector);
    this.appRef.attachView(component.hostView);
    const hostEle: HTMLElement = this.document.createElement('div');
    hostEle.setAttribute('id', id);
    component.instance.id = id;
    hostEle.appendChild((component.hostView as any).rootNodes[0]);
    this.document.body.appendChild(hostEle);
    return component;
  }
  destroy(com: ComponentRef<any>) {
    const timer = setTimeout(() => {
      const id = com.instance.id;
      this.appRef.detachView(com.hostView);
      com.destroy();
      try {
        const hostEle = this.document.getElementById(id);
        if (hostEle) {
          hostEle.parentElement.removeChild(hostEle);
        }
      }catch (e) {}
      clearTimeout(timer);
    }, 500);
  }
  makeID() {
    return Math.random().toString(16).slice(2, 8);
  }
}
