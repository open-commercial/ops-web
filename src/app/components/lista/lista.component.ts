import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import {BatchActionKey, BatchActionsService} from '../../services/batch-actions.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent {
  displayPage = 1;

  @Input() infoTemplate: TemplateRef<any>;
  @Input() actionsTemplate: TemplateRef<any>;

  @Output() pageChange = new EventEmitter<number>();

  private pItems = [];
  @Input() set items(value: any[]) { this.pItems = value; }
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
  @Input() set batchActionKey(value: BatchActionKey) { this.pBatchActionKey = value; }
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
    } else {
      this.batchActionsService.removeElememt(this.pBatchActionKey, element.id);
    }
  }

  isSelected(item: any): boolean {
    if (!this.pBatchActionKey) { return false; }
    const element = BatchActionsService.getBatchElementFn(this.batchActionKey)(item);
    return this.batchActionsService.hasElement(this.pBatchActionKey, element.id);
  }
}
