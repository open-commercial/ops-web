import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import {BatchActionKey, BatchActionsService} from '../../services/batch-actions.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent {
  displayPage = 1;
  isSelectingAll = false;
  isAllItemsSelected = false;

  private getItemIdFn = null;

  @Input() infoTemplate: TemplateRef<any>;
  @Input() actionsTemplate: TemplateRef<any>;

  @Output() pageChange = new EventEmitter<number>();

  private pSize = 25;
  @Input() set size(value: number) { this.pSize = value; }
  get size(): number { return this.pSize; }

  private pItems = [];
  @Input() set items(value: any[]) {
    this.pItems = value;
    this.isAllItemsSelected = this.isAllSelected();
  }

  get items() { return this.pItems; }

  private pPage = 0;
  @Input() set page(value: number) {
    this.pPage = value;
    this.displayPage = this.pPage + 1;
  }
  get page() { return this.pPage; }

  private pTotalPages = 0;
  @Input() set totalPages(value: number) { this.pTotalPages = value; }
  get totalPages() { return this.pTotalPages; }

  private pTotalElements = 0;
  @Input() set totalElements(value: number) { this.pTotalElements = value; }
  get totalElements() { return this.pTotalElements; }

  private pBatchActionKey: BatchActionKey = null;
  @Input() set batchActionKey(value: BatchActionKey) {
    this.pBatchActionKey = value;
    if (this.pBatchActionKey) { this.getItemIdFn = BatchActionsService.getItemIdFn(this.pBatchActionKey); }
  }
  get batchActionKey(): BatchActionKey { return this.pBatchActionKey; }

  constructor(private batchActionsService: BatchActionsService) { }

  cambioDePagina(dPage) {
    this.pageChange.emit(dPage - 1);
  }

  toggleItemSelection($event, item: any) {
    if (!this.pBatchActionKey) { return; }
    const isSelected = $event.target.checked;
    const element = BatchActionsService.getBatchElementFn(this.batchActionKey)(item);
    if (isSelected) {
      this.batchActionsService.addElement(this.pBatchActionKey, element);
      this.isAllItemsSelected = this.isAllSelected();
    } else {
      this.batchActionsService.removeElememt(this.pBatchActionKey, element.id);
      this.isAllItemsSelected = false;
    }
  }

  isSelected(item: any): boolean {
    if (!this.pBatchActionKey) { return false; }
    const element = BatchActionsService.getBatchElementFn(this.batchActionKey)(item);
    return this.batchActionsService.hasElement(this.pBatchActionKey, element.id);
  }

  toggleAll($event) {
    if (!this.pBatchActionKey) { return; }
    const isSelected = $event.target.checked;
    this.isSelectingAll = true;

    if (isSelected) {
      this.items.forEach(item => {
        const element = BatchActionsService.getBatchElementFn(this.batchActionKey)(item);
        this.batchActionsService.addElement(this.pBatchActionKey, element);
      });
      this.isAllItemsSelected = true;
    } else {
      this.items.forEach(item => {
        const element = BatchActionsService.getBatchElementFn(this.batchActionKey)(item);
        this.batchActionsService.removeElememt(this.pBatchActionKey, element.id);
      });
      this.isAllItemsSelected = false;
    }

    this.isSelectingAll = false;
  }

  private isAllSelected(): boolean {
    if (!this.batchActionKey) { return false; }
    return this.pItems.every(i => this.batchActionsService.hasElement(this.pBatchActionKey, this.getItemIdFn(i) as number));
  }
}
