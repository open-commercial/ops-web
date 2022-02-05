import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientesService } from '../../services/clientes.service';
import { ItemSelectionModalDirective } from '../../directives/item-selection-modal.directive';
import { Observable } from 'rxjs';
import { Pagination } from '../../models/pagination';

@Component({
  selector: 'app-cliente-modal',
  templateUrl: './cliente-modal.component.html'
})
export class ClienteModalComponent extends ItemSelectionModalDirective {
  constructor(public activeModal: NgbActiveModal,
              private clientesService: ClientesService) {
    super(activeModal);
    this.searchInputPlaceholder = 'Buscar Cliente...';
  }

  getItemsObservable(): Observable<Pagination> {
    return this.clientesService.getClientes(this.searchTerm, this.page);
  }
}
