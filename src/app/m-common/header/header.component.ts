import { Component, OnInit } from '@angular/core';
import { WCookiesService } from '../../shared/w-cookies.service';
import { AccountService } from '../../shared/account/account.service';
import { WindowService } from '../../shared/window.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.styl']
})
export class HeaderComponent implements OnInit {
  username: string;
  constructor(private cookie: WCookiesService, private acccount: AccountService, private window: WindowService) { }
  inputParams= {
    padding: '0 20px'
  };

  ngOnInit() {
    this.username = this.cookie.get('accountName');
  }
  logout () {
    this.acccount.logout(this.cookie.get('sessionid'), () => {
      this.cookie.removeAll({path: '/'});
      this.window.location.href = '/boss/account/#/login';
    });
  }
}
