import { StorageService } from './../../services/storage.service';
import { BatchActionsService } from './../../services/batch-actions.service';
import { ListaDirective } from 'src/app/directives/lista.directive';
import { Component, Input, TemplateRef, ViewChild, ElementRef, OnInit } from '@angular/core';

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
export class ListaTableComponent extends ListaDirective implements OnInit {
  private pListaTableKey: ListaTableKey = null;
  @Input() set listaTableKey(value: ListaTableKey) { this.pListaTableKey = value; };
  get listaTableKey(): ListaTableKey { return this.pListaTableKey };

  private pTableConfig: TableFieldConfig[] = [];
  @Input() set tableConfig(value: TableFieldConfig[]) {
    this.pTableConfig = value;
  };
  get tableConfig(): TableFieldConfig[] { return this.pTableConfig; }

  private pTableCaption: string = 'Datos de la tabla';
  @Input() set tableCaption(value: string) { this.pTableCaption = value; }
  get tableCaption(): string { return this.pTableCaption; }

  hasColumnsThatCanBeHidden = false;
  canBeHiddenColumns: { [key: string]: boolean } = {};

  dynamicConfig: { [key: string]: TableFieldConfig } = {};

  @Input() tableHeadersTemplate: TemplateRef<any>;

  //For table movement
  private isDown = false;
  private startX: number;
  private scrollLeft: number;

  @ViewChild('tableContainer') tableContainer: ElementRef<HTMLDivElement>;

  constructor(protected batchActionsService: BatchActionsService,
              private storageService: StorageService) {
    super(batchActionsService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.generateInitValues();
  }

  private resolveConfig()
  {
    if (!this.listaTableKey || this.pTableConfig.length === 0) {
      return this.pTableConfig;
    }

    const storeConfig: TableFieldConfig[] = this.storageService.getItem(this.pListaTableKey);

    if (!storeConfig) {
      return this.pTableConfig;
    }

    const newConfig: TableFieldConfig[] = [];
    const mustBeKeys = Object.keys(this.pTableConfig[0]);

    if (mustBeKeys.length === 0) { return this.pTableConfig; }

    this.pTableConfig.forEach(c => {
      const sc: TableFieldConfig = storeConfig.find(e => e.field === c.field);
      const nc = sc !== undefined ? sc : c;

      const ncKeys = Object.keys(nc);
      mustBeKeys.forEach(k => {
        const ncHasKey = ncKeys.indexOf(k) >= 0;
        if (!ncHasKey) { nc[k] = c[k]; }
      });

      newConfig.push(nc);
    });

    this.pTableConfig = newConfig;
  }

  private generateInitValues():void {
    this.resolveConfig();

    this.pTableConfig.forEach((h: TableFieldConfig) => {
      if (h.canBeHidden) { this.canBeHiddenColumns[h.field] = h.hidden; }
      this.dynamicConfig[h.field] = h;
    });
    this.hasColumnsThatCanBeHidden = Object.keys(this.canBeHiddenColumns).length > 0;
  }

  toggleColumn(field: string) {
    const idx = this.pTableConfig.findIndex((th: TableFieldConfig) => th.field === field);
    if (idx >= 0) {
      const val = !this.pTableConfig[idx].hidden;
      this.pTableConfig[idx].hidden = val;
      this.dynamicConfig[field].hidden = val;
      this.canBeHiddenColumns[field] = val;
      if (this.pListaTableKey) {
        this.storageService.setItem(this.pListaTableKey, Object.values(this.dynamicConfig));
      }
    };
  }

  mouseDown($event) {
    this.isDown = true;
    this.tableContainer.nativeElement.classList.add('grabbing');
    this.startX = $event.pageX - this.tableContainer.nativeElement.offsetLeft;
    this.scrollLeft = this.tableContainer.nativeElement.scrollLeft;
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
