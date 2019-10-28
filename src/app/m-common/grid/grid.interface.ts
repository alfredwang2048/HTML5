import { TemplateRef } from '@angular/core';
export interface GridColumn {
  field: string;
  header: string;
  width: string | number;
  index?: number;
  slot?: TemplateRef<any>;
  headerSlot?: TemplateRef<any>;
  _renderHTML?: boolean;
}
export interface GridSelectEvent {
  rowData: any;
  rowIndex?: number;
}
export interface GridSlotEvent {
  rowIndex: number;
  rowData: any;
  event?: Event;
}
