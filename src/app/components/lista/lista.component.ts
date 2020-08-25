import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent implements OnInit {
  private pItems = [];
  displayPage = 1;

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

  @Input() infoTemplate: TemplateRef<any>;
  @Input() actionsTemplate: TemplateRef<any>;

  @Output() pageChange = new EventEmitter<number>();
  @Output() selectItem = new EventEmitter<any>();
  @Output() unselectItem = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  cambioDePagina(dPage) {
    this.pageChange.emit(dPage - 1);
  }
}
