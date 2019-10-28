import {Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {bandwidthRanges, parseSize} from '../../model/utils';

@Component({
  selector: 'app-bandwidth',
  templateUrl: './bandwidth.component.html',
  styleUrls: ['./bandwidth.component.styl']
})
export class BandwidthComponent implements OnInit, OnChanges {
  @Input()
  allBandwidth: Array<any>;
  @Input()
    bandwidthRanges = bandwidthRanges;
  @Input()
  currentBandwidth: any;
  @Input()
  inputWidth: string;
  @Input()
  inputName = '带宽';
  @Output()
  done: EventEmitter<any> = new EventEmitter();

  outputBandwidth = null;
  bandwidthDatas = null;
  bandwidthRange = this.bandwidthRanges[0];

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.allBandwidth) {
      this.allBandwidth = changes.allBandwidth.currentValue;
      if (this.currentBandwidth) {
        const currentItemSize = parseSize(this.currentBandwidth);
        if (this.bandwidthRanges.length === 2) {
          if (currentItemSize <= parseSize('100M')) {
            this.bandwidthRange = this.bandwidthRanges[0];
          } else {
            this.bandwidthRange = this.bandwidthRanges[1];
          }
        }else {
          if (currentItemSize <= parseSize('100M')) {
            this.bandwidthRange = bandwidthRanges[0];
          } else if (currentItemSize <= parseSize('200M')) {
            this.bandwidthRange = bandwidthRanges[1];
          } else if (currentItemSize <= parseSize('1G')) {
            this.bandwidthRange = bandwidthRanges[2];
          } else {
            this.bandwidthRange = bandwidthRanges[3];
          }
        }
      }
      this.changeBandwidthRange(this.bandwidthRange);
    }
  }

  selectOutputBandwidth(item) {
    this.outputBandwidth = item;
    this.done.emit(item);
  }

  changeBandwidthRange = (item) => {
    this.bandwidthRange = item;
    this.outputBandwidth = null;
    this.done.emit(null);
    if (this.allBandwidth) {
      switch (this.bandwidthRange.text) {
        case '小于100M':
          this.bandwidthDatas = [];
          this.allBandwidth.forEach((item1) => {
            if (item1.bandwidth <= parseSize('100M')) {
              this.bandwidthDatas.push(item1);
            }
          });
          break;
        case '100M-200M':
          this.bandwidthDatas = [];
          this.allBandwidth.forEach((item2) => {
            if (item2.bandwidth > parseSize('100M') && item2.bandwidth <= parseSize('200M')) {
              this.bandwidthDatas.push(item2);
            }
          });
          break;
        case '大于100M':
          this.bandwidthDatas = [];
          this.allBandwidth.forEach((item2) => {
            if (item2.bandwidth > parseSize('100M')) {
              this.bandwidthDatas.push(item2);
            }
          });
          break;
        case '200M-1G':
          this.bandwidthDatas = [];
          this.allBandwidth.forEach((item3) => {
            if (item3.bandwidth > parseSize('200M') && item3.bandwidth <= parseSize('1G')) {
              this.bandwidthDatas.push(item3);
            }
          });
          break;
        case '大于1G':
          this.bandwidthDatas = [];
          this.allBandwidth.forEach((item4) => {
            if (item4.bandwidth > parseSize('1G')) {
              this.bandwidthDatas.push(item4);
            }
          });
          break;
      }
    }
  }

}
