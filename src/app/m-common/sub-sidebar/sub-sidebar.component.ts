import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-sub-sidebar',
  templateUrl: './sub-sidebar.component.html',
  styleUrls: ['./sub-sidebar.component.styl']
})
export class SubSidebarComponent implements OnInit, OnChanges {
  @Input()
  model: SubModel;
  @Input()
  currentUrl: string;
  copyModel: SubModel;

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.currentUrl && JSON.stringify(this.model) !== '{}') {
      this.model.submenu.forEach(item => {
        if (!this.copyModel || JSON.stringify(this.copyModel) === '{}') {
          item.collapseOn = item.isDrop && item.main.test(this.currentUrl);
        } else {
          this.copyModel.submenu.forEach(copyItem => {
            if (copyItem.isDrop && copyItem.title == item.title) {
              if (copyItem.collapseOn) {
                item.collapseOn = copyItem.collapseOn;
              } else {
                item.collapseOn = item.isDrop && item.main.test(this.currentUrl);
              }
            }
          });
        }
      });

      this.copyModel = JSON.parse(JSON.stringify(this.model));
    }
  }

  collapseOnChange(e, submenu){
    this.model.submenu.forEach(item=>{
      if(item.title ==submenu.title){
        item.collapseOn = e;
      }
    });

    this.copyModel = JSON.parse(JSON.stringify(this.model));
  }
}

interface SubModel {
  title: string;
  submenu: Array<any>;
}
