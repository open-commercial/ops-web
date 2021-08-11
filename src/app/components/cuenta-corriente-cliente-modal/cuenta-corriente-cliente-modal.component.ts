import { Component, ElementRef, ViewChild } from '@angular/core';
import { CuentaCorrienteCliente } from '../../models/cuenta-corriente';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CuentasCorrientesService } from '../../services/cuentas-corrientes.service';
import { finalize } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';

@Component({
  selector: 'app-cuenta-corriente-cliente-modal',
  templateUrl: './cuenta-corriente-cliente-modal.component.html',
  styleUrls: ['./cuenta-corriente-cliente-modal.component.scss']
})
export class CuentaCorrienteClienteModalComponent {
  cccs: CuentaCorrienteCliente[] = [];
  clearLoading = false;
  loading = false;
  busqueda = '';
  cccSeleccionado: CuentaCorrienteCliente = null;

  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  @ViewChild('searchInput') searchInput: ElementRef;

  constructor(public activeModal: NgbActiveModal,
              private cuentasCorrienteService: CuentasCorrientesService) { }

  getCccs(clearResults = false) {
    this.page += 1;
    if (clearResults) {
      this.clearLoading = true;
      this.page = 0;
      this.cccs = [];
    } else {
      this.loading = true;
    }

    this.cuentasCorrienteService.getCuentasCorrientesCliente(this.busqueda, this.page)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.clearLoading = false;
        })
      )
      .subscribe((p: Pagination) => {
        p.content.forEach((e) => this.cccs.push(e));
        this.totalElements = p.totalElements;
        this.totalPages = p.totalPages;
        this.size = p.size;
      })
    ;
  }

  buscar() {
    this.getCccs(true);
  }

  loadMore() {
    this.getCccs();
  }

  select(ccc: CuentaCorrienteCliente) {
    this.cccSeleccionado = ccc;
  }

  seleccionarCcc() {
    if (this.cccSeleccionado) {
      this.activeModal.close(this.cccSeleccionado);
    }
  }
}
