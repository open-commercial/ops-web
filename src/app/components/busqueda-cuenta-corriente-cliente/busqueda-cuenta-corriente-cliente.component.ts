import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CuentaCorrienteCliente } from '../../models/cuenta-corriente';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CuentaCorrienteClienteModalComponent } from '../cuenta-corriente-cliente-modal/cuenta-corriente-cliente-modal.component';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-busqueda-cuenta-corriente-cliente',
  templateUrl: './busqueda-cuenta-corriente-cliente.component.html',
  styleUrls: ['./busqueda-cuenta-corriente-cliente.component.scss']
})
export class BusquedaCuentaCorrienteClienteComponent implements OnInit {
  private _ccc: CuentaCorrienteCliente = null;
  helper = HelperService;

  @Input()
  set ccc(ccc: CuentaCorrienteCliente) {
    this._ccc = ccc;
  }

  get ccc(): CuentaCorrienteCliente { return this._ccc; }

  @Output() select = new EventEmitter<CuentaCorrienteCliente>();

  constructor(private modalService: NgbModal) { }

  ngOnInit() {
  }

  showCccModal() {
    const modalRef = this.modalService.open(CuentaCorrienteClienteModalComponent, { scrollable: true });
    modalRef.result.then((ccc: CuentaCorrienteCliente) => {
      this.ccc = ccc;
      this.select.emit(this.ccc);
    }, (reason) => { /*console.log(reason);*/ });
  }

  clearCcc() {
    this.ccc = null;
  }
}
