import { Cliente } from './../../../../models/cliente';
import { Movimiento } from './../../../../models/movimiento';
import { ClientesService } from './../../../../services/clientes.service';
import { NotasService } from './../../../../services/notas.service';
import { ConfiguracionesSucursalService } from './../../../../services/configuraciones-sucursal.service';
import { AuthService } from './../../../../services/auth.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { FormasDePagoService } from './../../../../services/formas-de-pago.service';
import { RecibosService } from './../../../../services/recibos.service';
import { LoadingOverlayService } from './../../../../services/loading-overlay.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MensajeService } from 'src/app/services/mensaje.service';
import { SucursalesService } from 'src/app/services/sucursales.service';
import { ActivatedRoute, Router } from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { RecibosDirective } from 'src/app/directives/recibos.directive';

@Component({
  selector: 'app-recibos-venta',
  templateUrl: './recibos-venta.component.html'
})
export class RecibosVentaComponent extends RecibosDirective implements OnInit {
  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected fb: UntypedFormBuilder,
              protected modalService: NgbModal,
              protected recibosService: RecibosService,
              protected formasDePagoService: FormasDePagoService,
              protected usuariosService: UsuariosService,
              protected authService: AuthService,
              protected configuracionesSucursalService: ConfiguracionesSucursalService,
              protected notasService: NotasService,
              private clientesService: ClientesService) {
    super(
      route, router, sucursalesService, loadingOverlayService, mensajeService,
      fb, modalService, recibosService, formasDePagoService, usuariosService,
      authService, configuracionesSucursalService, notasService
    );
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getMovimiento(): Movimiento {
    return Movimiento.VENTA;
  }

  getTerminosFromQueryParams(ps) {
    const terminos = super.getTerminosFromQueryParams(ps);

    if (ps.idCliente && !isNaN(ps.idCliente)) {
      this.filterForm.get('idCliente').setValue(Number(ps.idCliente));
      terminos.idCliente = Number(ps.idCliente);
    }

    return terminos;
  }

  createFilterForm() {
    super.createFilterForm();
    this.filterForm.addControl('idCliente', new UntypedFormControl(null));
  }

  resetFilterForm() {
    super.resetFilterForm();
    this.filterForm.get('idCliente').setValue(null);
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    super.getAppliedFilters();
    if (values.idCliente) {
      this.appliedFilters.push({ label: 'Cliente', value: values.idCliente, asyncFn: this.getClienteInfoAsync(values.idCliente) });
    }
  }

  getClienteInfoAsync(id: number): Observable<string> {
    return this.clientesService.getCliente(id).pipe(map((c: Cliente) => c.nombreFiscal));
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret = super.getFormValues();

    if (values.idCliente) { ret.idCliente = values.idCliente; }

    return ret;
  }

  afterReciboDelete() {
    location.reload();
  }
}
