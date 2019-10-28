import { Injectable, ComponentRef, Optional } from '@angular/core';
import { MessageComponent } from './message.component';
import { DynamicGenerateService } from '../dynamic-generate.service';
@Injectable()
export class MsgService {
  component = null;
  constructor(@Optional() private root: MessageComponent,
              private dynamic: DynamicGenerateService) {
    this.createComponent();
  }
  addMessage(msg: Message) {
    if (!this.component) {
      this.createComponent();
    }
    this.component.instance.onDestroy = () => {
      this.dynamic.destroy(this.component.copy);
    };
    this.component.instance.show(msg);
  }
  createComponent() {
    const com: ComponentRef<any> = this.dynamic.generator(MessageComponent);
    this.component = {
      instance: com.instance,
      id: com.instance.id,
      copy: com
    };
  }
}
export interface Message {
  type: 'success' | 'error' | 'warn' | 'info';
  msg: string;
}

