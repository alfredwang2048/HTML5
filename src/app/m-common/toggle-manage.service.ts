import {Injectable} from '@angular/core';
import {WDropdownComponent} from './w-dropdown/w-dropdown.component';

@Injectable()
export class ToggleManageService {
  private dropDowns: Array<WDropdownComponent> = [];

  constructor() {
  }

  addComponent(component) {
    this.dropDowns.push(component);
  }

  removeComponent(uuid) {
    this.dropDowns = this.dropDowns.filter(drop => drop.uuid !== uuid);
  }

  hiddenOtherComponent(uuid) {
    this.dropDowns.forEach((value) => {
      if (value.uuid !== uuid) {
        value.showMenu = false;
      }
    });
  }
}
