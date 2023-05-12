import { AuthService } from './../../services/auth.service';
import { finalize } from 'rxjs/operators';
import { CuentasCorrientesService } from './../../services/cuentas-corrientes.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CuentaCorrienteCliente } from '../../models/cuenta-corriente';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CuentaCorrienteClienteModalComponent } from '../cuenta-corriente-cliente-modal/cuenta-corriente-cliente-modal.component';
import { HelperService } from '../../services/helper.service';
import { Rol } from 'src/app/models/rol';
import { Router } from '@angular/router';
import { MensajeService } from 'src/app/services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';

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

  allowedRolesToCreateClientes = [Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR];
  allowedRolesToEditClientes = [Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR];

  hasRoleToCreateClientes = false;
  hasRoleToEditClientes = false;

  constructor(private modalService: NgbModal,
              private router: Router,
              private cuentasCorrienteService: CuentasCorrientesService,
              private authService: AuthService,
              private mensajeService: MensajeService) {
    this.hasRoleToCreateClientes = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCreateClientes);
    this.hasRoleToEditClientes = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToEditClientes);
  }

  showCccModal() {
    const modalRef = this.modalService.open(CuentaCorrienteClienteModalComponent, { scrollable: true, keyboard: true });
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

  async addCliente() {
    if (!this.hasRoleToEditClientes) {
      await this.mensajeService.msg('No tiene permiso para editar clientes.', MensajeModalType.ERROR);
      return;
    }
    this.router.navigate(['/clientes/nuevo']);
  }

  editCliente() {
    if (!this.hasRoleToEditClientes) {
      this.mensajeService.msg('No tiene permiso para editar clientes.', MensajeModalType.ERROR);
      return;
    }
    if (!this.pCcc?.cliente) { return };
    this.router.navigate(['/clientes/editar', this.pCcc.cliente.idCliente]);
  }
}
