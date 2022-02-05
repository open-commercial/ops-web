import { Component } from '@angular/core';
import { Observable} from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProveedoresService } from '../../services/proveedores.service';
import { Pagination } from '../../models/pagination';
import { ItemSelectionModalDirective } from '../../directives/item-selection-modal.directive';

@Component({
  selector: 'app-proveedor-modal',
  templateUrl: './proveedor-modal.component.html',
  styleUrls: ['./proveedor-modal.component.scss']
})
export class ProveedorModalComponent extends ItemSelectionModalDirective {
  constructor(public activeModal: NgbActiveModal,
              private proveedoresService: ProveedoresService) {
    super(activeModal);
    this.searchInputPlaceholder = 'Buscar Proveedor...';
  }

  getItemsObservable(): Observable<Pagination> {
    return this.proveedoresService.getProveedores(this.searchTerm, this.page);
  }
}
