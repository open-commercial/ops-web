import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent implements OnInit {
  private pItems = [];
  @Input() set items(value: any[]) { this.pItems = value; }
  get items() { return this.pItems; }

  private pPage = 0;
  @Input() set page(value: number) { this.pPage = value; }
  get page() { return this.pPage; }

  private pTotalPages = 0;
  @Input() set totalPages(value: number) { this.pTotalPages = value; }
  get totalPages() { return this.pTotalPages; }

  @Input() infoTemplate: TemplateRef<any>;
  @Input() actionsTemplate: TemplateRef<any>;

  @Output() loadMoreClick = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  loadMore() {
    this.loadMoreClick.emit();
  }
}
