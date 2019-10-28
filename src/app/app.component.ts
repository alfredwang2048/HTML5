import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {WCookiesService} from './shared/w-cookies.service';
import {WindowService} from './shared/window.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent implements OnInit {

  constructor(private cookie: WCookiesService,
              private router: Router,
              private http: HttpClient) {

  }

  ngOnInit() {
    console.log(this.cookie);
  }
}
