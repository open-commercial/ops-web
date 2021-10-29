import { ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { SelectableListComponent } from '../../components/selectable-list/selectable-list.component';
import { Observable } from 'rxjs';

export abstract class ItemSelectionModalDirective {
  items: any[] = [];
  clearLoading = false;
  loading = false;
  searchTerm = '';
  searchInputPlaceholder = 'Buscar ítem...';

  selectedItem = null;

  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;
  isLastPage = false;

  @ViewChild('selectableList', { static: false }) selectableList: SelectableListComponent;

  protected constructor(public activeModal: NgbActiveModal) { }

  abstract getItemsObservable(): Observable<Pagination>;

  protected getItems(clearResults = false) {
    this.page += 1;
    if (clearResults) {
      this.clearLoading = true;
      this.page = 0;
      this.items = [];
      this.isLastPage = false;
    } else {
      if (this.isLastPage) { return; }
      this.loading = true;
    }

    this.getItemsObservable()
      .pipe(finalize(() => {
        this.loading = false;
        this.clearLoading = false;
      }))
      .subscribe((p: Pagination) => {
        p.content.forEach((e) => this.items.push(e));
        this.totalElements = p.totalElements;
        this.totalPages = p.totalPages;
        this.size = p.size;
        this.isLastPage = p.last;
      })
    ;
  }

  search() {
    if (this.selectableList) { this.selectableList.clearSelectedItem(); }
    this.getItems(true);
  }

  loadMore() {
    this.getItems();
  }

  setSelectedItem(item) {
    this.selectedItem = item;
  }

  selectWithEnter(item) {
    this.setSelectedItem(item);
    // Si no se hace con un timeout puede producir un error.
    setTimeout(() => this.selectItem(), 100);
  }

  selectItem() {
    if (this.selectedItem) {
      this.activeModal.close(this.selectedItem);
    }
  }
}
