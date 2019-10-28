/*export const bandwidthRanges = [
  {name: 'range1', text: '小于100M'},
  {name: 'range2', text: '100M-200M'},
  {name: 'range3', text: '200M-1G'},
  {name: 'range4', text: '大于1G'}
];*/
import {AbstractControl} from '@angular/forms';

export const bandwidthRanges = [{name: 'range1', text: '小于100M'}, {name: 'range2', text: '大于100M'}];

export function parseSize(sizeStr: string) {

  const K = 1024;
  const quantity = sizeStr.substr(sizeStr.length - 1, 1);
  const size = parseInt(sizeStr, 10);
  if (quantity === 'K' || quantity === 'k') {
    return size * K;
  } else if (quantity === 'M' || quantity === 'm') {
    return size * K * K;
  } else if (quantity === 'G' || quantity === 'g') {
    return size * K * K * K;
  } else if (quantity === 'T' || quantity === 't') {
    return size * K * K * K * K;
  } else if (quantity === 'P' || quantity === 'p') {
    return size * K * K * K * K * K;
  } else {
    return parseInt(sizeStr, 10);
  }
}

export const purposes = [{name: 'NORMAL', text: '普通'}, {name: 'TEST', text: '测试'}, {
  name: 'Syscloud',
  text: 'Syscloud'
}];

export function timeStampRoundToString(time) {
  const K = 60;
  const sizeMap = {
    '个月': K * K * 24 * 30,
    '天': K * K * 24,
    '小时': K * K,
    '分钟': K,
  };
  let roundSize = '0秒', flag = true;
  if (time < K) {
    roundSize = time < 0 ? '0秒前' : Math.floor(time) + '秒前';
  } else {
    Object.keys(sizeMap).forEach((value) => {
      const s = time / sizeMap[value];
      if (s >= 1 && flag) {
        roundSize = Math.floor(s) + value + '前';
        flag = false;
      }
    });
  }
  return roundSize;
}

export interface HasUuidInventory {
  uuid: string;

  [props: string]: any;
}

export function arrayUpdateItem(arr: Array<HasUuidInventory>, item: HasUuidInventory, type: string, addMaxLength = 10) {
  if (type === 'add') {
    arr.unshift(item);
    if (arr.length > addMaxLength) {
      arr.pop();
    }
  } else if (type === 'update') {
    arr.forEach(it => {
      if (it.uuid === item.uuid) {
        Object.assign(it, item);
        return false;
      }
    });
  } else if (type === 'delete') {
    const index = arr.findIndex(it => it.uuid === item.uuid);
    arr.splice(index, 1);
  }
}

export function chooseOtherFromAll(allArr: Array<HasUuidInventory>, partArr: Array<string>, type: string) {
  partArr.forEach(it => {
    allArr.forEach((item, index) => {
      if (item[type] === it) {
        allArr.splice(index, 1);
      }
    });
  });
  return allArr;
}

export enum ConnectionMode {
  DOUBLE_TUNNEL = '双专线',
  TUNNEL_INTERNET = '专线+公网',
  DOUBLE_INTERNET = '双公网'
}

/*随机uuid*/
export function RandomUuid() {
  const dec2hex = [];
  for (let k = 0; k <= 15; k++) {
    dec2hex[k] = k.toString(16);
  }

  return function () {
    let uuid = '';
    for (let i = 1; i <= 36; i++) {
      if (i === 9 || i === 14 || i === 19 || i === 24) {
        continue;
      } else if (i === 15) {
        uuid += 4;
      } else if (i === 20) {
        uuid += dec2hex[(Math.random() * 4 | 0 + 8)];
      } else {
        uuid += dec2hex[(Math.random() * 15 | 0)];
      }
    }
    return uuid;
  }();
}

/*正则*/
export const COMMON_PATTERN = {
  ip: '^(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])$',
  port: '^([1-9]|[1-9]\\d|[1-9]\\d{2}|[1-9]\\d{3}|[1-5]\\d{4}|6[0-4]\\d{3}|65[0-4]\\d{2}|655[0-2]\\d|6553[0-5])$',
  number: /^[1-9]{1}[0-9]*$/
};

export function TimeFormatting(time) {
  const now = new Date(time);
  const [year, month, day, hh, mm, ss] = [
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  ];
  let clock = year + '-';

  if (month < 10) clock += '0';
  clock += month + '-';

  if (day < 10) clock += '0';
  clock += day + ' ';

  if (hh < 10) clock += '0';
  clock += hh + ':';

  if (mm < 10) clock += '0';
  clock += mm + ':';

  if (ss < 10) clock += '0';
  clock += ss;

  return (clock);
}

export function extend(...rest) {
  let src,
    copy,
    options,
    clone,
    target = rest[0] || {},
    i = 1,
    copyIsArray,
    deep = false;
  if (typeof target === 'boolean') {
    deep = target;
    target = rest[i] || {};
    i++;
  }
  if (typeof target !== 'object' && typeof target !== 'function') {
    target = {};
  }
  if (i === rest.length) {
    i--;
    return target;
  }
  for (; i < rest.length; i++) {
    if ((options = rest[i]) != null) {
      Object.keys(options).forEach(key => {
        src = target[key];
        copy = options[key];
        copyIsArray = Array.isArray(copy);
        if (target !== copy) {
          if (deep && copy && (typeof copy === 'object' || copyIsArray)) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && Array.isArray(src) ? src : [];
            } else {
              clone = src ? src : {};
            }
            target[key] = extend(deep, clone, copy);
          } else if (copy !== undefined) {
            target[key] = copy;
          }
        }
      });
    }
  }
  return target;
}

export function deepCopy(obj) {
  if (typeof obj !== 'object') {
    return;
  }
  const newObj = obj instanceof Array ? [] : {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
    }
  }
  return newObj;
}

export function validatorIP(isValidate = true, hasCidr = true) {
  return function (control: AbstractControl) {
    const reg = /^(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(3[0-2]|[12][0-9]|[0-9]))?$/;
    const ips = control.value ? control.value.split(/\n\s*/) : [];
    const errorIps = [],
      needIps = [];
    ips.forEach((ip) => {
      if (ip.length) {
        if (reg.test(ip)) {
          if (!isValidate) {
            needIps.push(ip.indexOf('/') === -1 && hasCidr ? ip + '/32' : ip);
          }
        }else {
          if (isValidate) {
            errorIps.push(ip);
          }
        }
      }
    });
    return isValidate ? (errorIps.length ? {invalidIp: `不合法的IP${errorIps}`} : false) : needIps;
  };
}
