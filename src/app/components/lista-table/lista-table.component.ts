import { BatchActionsService } from './../../services/batch-actions.service';
import { ListaDirective } from 'src/app/directives/lista.directive';
import { Component, Input, TemplateRef, ViewChild, ElementRef } from '@angular/core';

export enum ListaTableKey {
  PRODUCTOS = 'lt-porductos',
  FACTURAS_VENTA = 'lt-facturas-venta'
}

export interface TableFieldConfig {
  field: string;
  name: string;
  canBeHidden: boolean;
  hidden: boolean;
}

@Component({
  selector: 'app-lista-table',
  templateUrl: './lista-table.component.html',
  styleUrls: ['./lista-table.component.scss']
})
export class ListaTableComponent extends ListaDirective {
  private pTableConfig: TableFieldConfig[] = [];
  @Input() set tableConfig(value: TableFieldConfig[]) {
    this.pTableConfig = value;
    this.pTableConfig.forEach((h: TableFieldConfig) => {
      if (h.canBeHidden) { this.canBeHiddenColumns[h.field] = h.hidden; }
      this.dynamicConfig[h.field] = h;
    });
    this.hasColumnsThatCanBeHidden = Object.keys(this.canBeHiddenColumns).length > 0;
  };

  get tableConfig(): TableFieldConfig[] { return this.pTableConfig; }

  hasColumnsThatCanBeHidden = false;
  canBeHiddenColumns: { [key: string]: boolean } = {};

  dynamicConfig: { [key: string]: TableFieldConfig } = {};

  @Input() tableHeadersTemplate: TemplateRef<any>;

  //For table movement
  isDown = false;
  startX: number;
  scrollLeft: number;

  @ViewChild('tableContainer') tableContainer: ElementRef<HTMLDivElement>;

  constructor(protected batchActionsService: BatchActionsService) {
    super(batchActionsService);
  }

  toggleColumn(field: string) {
    const idx = this.pTableConfig.findIndex((th: TableFieldConfig) => th.field === field);
    if (idx >= 0) {
      const val = !this.pTableConfig[idx].hidden;
      this.pTableConfig[idx].hidden = val;
      this.dynamicConfig[field].hidden = val;
      this.canBeHiddenColumns[field] = val;
    };
  }

  mouseDown($event) {
    this.isDown = true;
    //console.log($event);
    this.tableContainer.nativeElement.classList.add('grabbing');
    this.startX = $event.pageX - this.tableContainer.nativeElement.offsetLeft;
    this.scrollLeft = this.tableContainer.nativeElement.scrollLeft;
    //console.log(this.startX);
  }

  mouseLeave() {
    this.isDown = false;
    this.tableContainer.nativeElement.classList.remove('grabbing');
  }

  mouseUp() {
    this.isDown = false;
    this.tableContainer.nativeElement.classList.remove('grabbing');
  }

  mouseMove($event) {
    if (!this.isDown) { return; }
    $event.preventDefault();
    const x = $event.pageX - this.tableContainer.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 2;

    this.tableContainer.nativeElement.scrollLeft = this.scrollLeft - walk;
  }
}
