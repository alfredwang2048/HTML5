import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter, first } from 'rxjs/operators';
import { WCookiesService } from './shared/w-cookies.service';
import { WindowService } from './shared/window.service';
import { SubMenu } from './model/menu';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent implements OnInit {
  sidebarWidth = '110px';
  subbarWidth = '140px';
  toggleType = 'normal';
  sidebarModel = [];
  subbarModel: any = {};
  selectedIndex = -1;
  currentUrl: string;
  constructor(private cookie: WCookiesService, private router: Router, private http: HttpClient, private window: WindowService) {
    cookie.setOptions({path: '/'});
  }
  toggleMenu(options: {toggle: string, width: string}) {
    const sideCookie = options.toggle === 'mini' ? 'close' : 'open';
    this.cookie.put('sidebar', sideCookie);
    this.toggleType = options.toggle;
    this.sidebarWidth = options.width;
  }

  ngOnInit() {
    const sideCookie = this.cookie.get('sidebar');
    if (sideCookie === 'open') {
      this.toggleType = 'normal';
      this.sidebarWidth = '110px';
    }else {
      this.toggleType = 'mini';
      this.sidebarWidth = '36px';
    }
    this.router.events.pipe(
      filter(evnet => evnet instanceof NavigationEnd),
      // first()
    ).subscribe((e) => {
      this.getMenuMessage();
    });
  }
  getMenuMessage() {
    // this.http.get('/cxpstatics/js/bossMenu.json').subscribe((menu: Array<any>) => {
    //   this.sidebarModel = menu;
    //   const pathname = this.window.location.href;
    //   this.currentUrl = pathname;
    //   this.sidebarModel.forEach((item, index) => {
    //     if (new RegExp(item.main).test(pathname)) {
    //       this.selectedIndex = index;
    //     }
    //   });
    //   SubMenu.forEach((item) => {
    //     if (item.match.test(pathname)) {
    //       this.subbarModel = item;
    //     }
    //   })
    // })

    if (this.sidebarModel.length) {
      this.manageMenu();
    }else {
      this.http.get('/cxpstatics/js/bossMenu.json').subscribe((menu: Array<any>) => {
        this.sidebarModel = menu;
        this.manageMenu();
      });
    }
  }
  manageMenu() {
    const pathname = this.window.location.href;
    this.currentUrl = pathname;
    this.sidebarModel.forEach((item, index) => {
      if (new RegExp(item.main).test(pathname)) {
        this.selectedIndex = index;
      }
    });

    SubMenu.forEach((item) => {
      if (item.match.test(pathname)) {
        this.subbarModel = item;
      }
    });
  }
}
