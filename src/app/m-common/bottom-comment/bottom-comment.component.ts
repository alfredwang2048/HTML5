import {Component, OnInit, Input} from '@angular/core';
@Component({
  selector: 'app-bottom-comment',
  templateUrl: './bottom-comment.component.html',
  styleUrls: ['./bottom-comment.component.styl'],
})
export class BottomCommentComponent implements OnInit {
  @Input()
  comment: String;
  constructor() {
  }
  ngOnInit() {
  }
}
