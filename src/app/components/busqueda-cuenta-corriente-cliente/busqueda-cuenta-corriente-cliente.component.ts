import { finalize } from 'rxjs/operators';
import { CuentasCorrientesService } from './../../services/cuentas-corrientes.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CuentaCorrienteCliente } from '../../models/cuenta-corriente';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CuentaCorrienteClienteModalComponent } from '../cuenta-corriente-cliente-modal/cuenta-corriente-cliente-modal.component';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-busqueda-cuenta-corriente-cliente',
  templateUrl: './busqueda-cuenta-corriente-cliente.component.html',
  styleUrls: ['./busqueda-cuenta-corriente-cliente.component.scss']
})
export class BusquedaCuentaCorrienteClienteComponent {
  private pReadOnly = false;
  private pCcc: CuentaCorrienteCliente = null;
  helper = HelperService;

  firstTime = true;
  refreshing = false;

  @Input()
  set ccc(ccc: CuentaCorrienteCliente) {
    this.pCcc = ccc;
    this.refreshingCCC();
  }
  get ccc(): CuentaCorrienteCliente { return this.pCcc; }

  @Output() select = new EventEmitter<CuentaCorrienteCliente>();

  @Input()
  set readOnly(ro: boolean) { this.pReadOnly = ro; }
  get readOnly() { return this.pReadOnly; }

  constructor(private modalService: NgbModal,
              private cuentasCorrienteService: CuentasCorrientesService) { }

  showCccModal() {
    const modalRef = this.modalService.open(CuentaCorrienteClienteModalComponent, { scrollable: true });
    modalRef.result.then((ccc: CuentaCorrienteCliente) => {
      this.pCcc = ccc;
      this.select.emit(this.ccc);
    }, () => { return; });
  }

  refreshingCCC() {
    if (this.pCcc && this.pCcc.cliente && this.pCcc.cliente.idCliente && this.firstTime) {
      this.firstTime = false;
      this.refreshing = true;
      this.cuentasCorrienteService.getCuentaCorrienteCliente(this.pCcc.cliente.idCliente)
        .pipe(finalize(() => this.refreshing = false))
        .subscribe({
          next: ccc => {
            this.pCcc = ccc;
            this.select.emit(this.ccc);
          }
        })
      ;
    }
  }

  clearCcc() { this.ccc = null; }
}
