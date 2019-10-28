import {Injectable} from '@angular/core';
import {DocumentService} from './document.service';

@Injectable()
export class WCookiesService {
  private defaultOptions: CookieOptions;

  constructor(private document: DocumentService) {
    /*
     * 初始化options
     */
    const baseHref = document.querySelector('base').getAttribute('href');
    const path = baseHref ? baseHref.replace(/^(https?:)?\/\/[^/]*/, '') : '/';
    this.defaultOptions = {
      path: path,
      secure: false,
      httpOnly: false
    };
  }

  private static safeGetCookie(document): string {
    try {
      return document.cookie || '';
    } catch (e) {
      return '';
    }
  }

  private static safeDecodeURIComponent(str) {
    try {
      return decodeURIComponent(str);
    } catch (e) {
      return str;
    }
  }

  private static safeEncodeURIComponent(str) {
    try {
      return encodeURIComponent(str);
    } catch (e) {
      return str;
    }
  }

  private readCookies() {
    const currentCookie = WCookiesService.safeGetCookie(this.document),
      cookiesArray = currentCookie.split('; '),
      cookies = {},
      len = cookiesArray.length;
    let i = 0, cookie;
    for (; i < len; i++) {
      cookie = cookiesArray[i];
      const index = cookie.indexOf('=');
      if (index > 0) {
        const name = WCookiesService.safeDecodeURIComponent(cookie.substring(0, index));
        if (!cookies[name]) {
          cookies[name] = WCookiesService.safeDecodeURIComponent(cookie.substring(index + 1));
        }
      }
    }
    return cookies;
  }

  private buildCookieStr(key: string, value: string, options?: CookieOptions) {
    options = Object.assign({}, this.defaultOptions, options);
    let expires = options.expires;
    let str = '';
    if (!value) {
      expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
      value = '';
    }
    if (typeof expires === 'string') {
      expires = new Date(expires);
    }
    value = WCookiesService.safeEncodeURIComponent(value);
    str = key + '=' + value;
    str += options.path ? ';path=' + options.path : '';
    str += options.domain ? ';domain=' + options.domain : '';
    str += expires ? ';expires=' + expires.toUTCString() : '';
    str += options.secure ? ';secure=' + options.secure : '';
    str += options.httpOnly ? ';httpOnly=' + options.httpOnly : '';
    return str;
  }

  /*
   * 设置options
   */
  public setOptions(options: CookieOptions) {
    Object.assign(this.defaultOptions, options);
  }

  /*
   * 获取单个cookie值
   */
  public get (key: string): string {
    const cookies = this.readCookies();
    if (key in cookies) {
      return cookies[key];
    }
    return '';
  }

  /*
   * 获取cookie对象
   */
  public getAll() {
    return this.readCookies();
  }

  /*
   * 设置cookie
   */
  public put(key: string, value: string, options?: CookieOptions) {
    this.document.cookie = this.buildCookieStr(key, value, options);
  }

  public remove(key: string, options: CookieOptions) {
    this.put(key, undefined, options);
  }

  public removeAll(options: CookieOptions) {
    const cookies = this.getAll();
    Object.keys(cookies).forEach((key) => {
      this.remove(key, options);
    });
  }
}

interface CookieOptions {
  path?: string;
  domain?: string;
  expires?: string | Date;
  secure?: boolean;
  httpOnly?: boolean;
}
