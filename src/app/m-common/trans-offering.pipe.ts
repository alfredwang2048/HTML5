import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transOffering'
})
export class TransOfferingPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let result = null;
    if(value.indexOf('RJ45')!=-1){
      result = '电口';
    }else if(value.indexOf('SFP')!=-1) {
      result = '光口';
    }
    return result;
  }

}
