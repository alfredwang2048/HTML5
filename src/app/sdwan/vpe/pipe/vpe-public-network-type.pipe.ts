import {Pipe, PipeTransform} from '@angular/core';
import {PublicNetworkType} from '../vpe.component';

@Pipe({
  name: 'vpePublicNetworkType'
})
export class VpePublicNetworkTypePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let typeName = '';
    PublicNetworkType.forEach((v) => {
      if (v.value === value) {
        typeName = v.name;
      }
    });
    return typeName;
  }

}
