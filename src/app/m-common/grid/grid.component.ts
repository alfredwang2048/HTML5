import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  AfterContentChecked,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
  KeyValueDiffer,
  KeyValueDiffers,
  ContentChildren,
  QueryList, DoCheck
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {GridColumn, GridSelectEvent, GridSlotEvent} from './grid.interface';
import { GridColumnComponent } from './grid-column/grid-column.component';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.styl'],
  encapsulation: ViewEncapsulation.None
})
export class GridComponent implements OnInit, OnChanges, AfterContentChecked, DoCheck {
  @Input()
  data: Array<any>;
  @Input()
  currentRowIndex: number;
  @Input()
  placeholder = '暂无数据';
  @Input('text-center')
  textCenter = false;
  @Input()
  height: string;
  @Input()
  hasBorder: false;
  @Output('selection-change')
  selectionChange: EventEmitter<GridSelectEvent> = new EventEmitter();
  @Output('cell-click')
  cellClick: EventEmitter<GridSlotEvent> = new EventEmitter();
  @ContentChildren(GridColumnComponent)
  columnElements: QueryList<GridColumnComponent>;
  public columns: GridColumn[] = [];
  private differ: KeyValueDiffer<any, any>;
  private dataDiffer: KeyValueDiffer<any, any>;
  selectIndex: number;
  selectData: any;
  isEmpty: boolean;
  @Input()
  loading: boolean;
  constructor(private sanitizer: DomSanitizer, private differs: KeyValueDiffers) {
    this.differ = this.differs.find([]).create();
    this.dataDiffer = this.differs.find([]).create();
  }
  updateColumns() {
    this.columns = this.columnElements.toArray();
  }
  renderHtml(str) {
    return this.sanitizer.bypassSecurityTrustHtml(str);
  }
  isTemplateRef(content: any): boolean {
    return content && typeof content === 'object';
  }
  ngOnInit() {
    if (!this.data) {
      this.data = [];
    }
    this.selectIndex = -1;
    this.selectData = null;
    this.isEmpty = this.data.length === 0 ? true : false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.data && !changes.data.isFirstChange()) {
      this.data = changes.data.currentValue;
      this.selectIndex = -1;
      this.selectData = null;
      this.isEmpty = this.data.length === 0;
    }
    if (changes && changes.currentRowIndex && ! changes.currentRowIndex.isFirstChange()) {
      this.selectIndex = changes.currentRowIndex.currentValue;
    }
  }
  ngDoCheck() {
    const change = this.dataDiffer.diff(this.data);
    if (change) {
      this.selectIndex = -1;
      this.selectData = null;
      this.isEmpty = this.data.length === 0;
    }
  }
  ngAfterContentChecked() {
    const change = this.differ.diff(this.columnElements.toArray());
    if (change) {
      this.updateColumns();
    }
  }
  cellClickHandler(e, rowIndex) {
    const rowData = this.selectData = this.data[rowIndex];
    this.selectIndex = rowIndex;
    this.cellClick.emit({rowIndex: rowIndex, rowData: rowData, event: e});
  }
  selectHandler(e, rowIndex) {
    this.selectionChange.emit({rowIndex, rowData: this.selectData});
  }
}
