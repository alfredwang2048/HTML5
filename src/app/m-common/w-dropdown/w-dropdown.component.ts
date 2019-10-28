import {Component, HostListener, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {dropAnimation} from '../animation';
import {ToggleManageService} from '../toggle-manage.service';

@Component({
  selector: 'app-w-dropdown',
  templateUrl: './w-dropdown.component.html',
  styleUrls: ['./w-dropdown.component.styl'],
  animations: [dropAnimation]
})
export class WDropdownComponent implements OnInit, OnDestroy {
  showMenu = false;
  @Input()
  trigger: 'click' | 'hover' = 'click';
  @Input()
  iconColor: string;
  @Input()
  inputParams: any;
  timer: any;
  globalListenFunc: Function;
  uuid = Math.random().toString(16).slice(2, 8);
  @HostListener('mouseenter') mouseenter = () => {
    if (this.trigger !== 'hover') {
      return;
    }
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.showMenu = true;
  }
  @HostListener('mouseleave') mouseleave = () => {
    if (this.trigger !== 'hover') {
      return;
    }
    this.timer = setTimeout(() => {
      this.closeMenu();
      clearTimeout(this.timer);
    }, 400);
  }
  @HostListener('click', ['$event']) hostClick = (e) => {
    if (this.trigger === 'hover') {
      return;
    }
    e.stopPropagation();
  }
  constructor(private renderer: Renderer2, private toggleMgr: ToggleManageService) {
  }

  ngOnInit() {
    this.toggleMgr.addComponent(this);
  }

  ngOnDestroy(): void {
    if (this.globalListenFunc) {
      this.globalListenFunc();
    }
    this.toggleMgr.removeComponent(this.uuid);
  }

  openMenu() {
    if (this.trigger === 'hover') {
      return;
    }
    this.showMenu = !this.showMenu;
    this.toggleMgr.hiddenOtherComponent(this.uuid);
    this.globalListenFunc = this.renderer.listen(
      'document',
      'click',
      () => {
        this.closeMenu();
      }
    );
  }

  closeMenu(): void {
    this.showMenu = false;
    if (this.globalListenFunc) {
      this.globalListenFunc();
    }
  }
}
