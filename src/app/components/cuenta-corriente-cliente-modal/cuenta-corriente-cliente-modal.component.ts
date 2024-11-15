import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CuentasCorrientesService } from '../../services/cuentas-corrientes.service';
import { Pagination } from '../../models/pagination';
import { ItemSelectionModalDirective } from '../../directives/item-selection-modal.directive';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cuenta-corriente-cliente-modal',
  templateUrl: './cuenta-corriente-cliente-modal.component.html'
})
export class CuentaCorrienteClienteModalComponent extends ItemSelectionModalDirective {
  constructor(public activeModal: NgbActiveModal,
              private readonly cuentasCorrienteService: CuentasCorrientesService) {
    super(activeModal);
    this.searchInputPlaceholder = 'Buscar Cliente...';
  }

  getItemsObservable(): Observable<Pagination> {
    return this.cuentasCorrienteService.getCuentasCorrientesCliente(this.searchTerm, this.page);
  }
}
