import { OnInit, Directive } from '@angular/core';
import {NotasDirective} from './notas.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../services/sucursales.service';
import {LoadingOverlayService} from '../services/loading-overlay.service';
import {MensajeService} from '../services/mensaje.service';
import {ClientesService} from '../services/clientes.service';
import {UntypedFormBuilder} from '@angular/forms';
import {UsuariosService} from '../services/usuarios.service';
import {AuthService} from '../services/auth.service';
import {ConfiguracionesSucursalService} from '../services/configuraciones-sucursal.service';
import {NotasService} from '../services/notas.service';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../components/mensaje-modal/mensaje-modal.component';
import {Observable} from 'rxjs';
import {Pagination} from '../models/pagination';
import {BusquedaNotaCriteria} from '../models/criterias/busqueda-nota-criteria';
import {Nota} from '../models/nota';
import {ProveedoresService} from '../services/proveedores.service';
import {Movimiento} from '../models/movimiento';

@Directive()
export abstract class NotasCreditoDirective extends NotasDirective implements OnInit {

  protected constructor(protected route: ActivatedRoute,
                        protected router: Router,
                        protected sucursalesService: SucursalesService,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService,
                        protected clientesService: ClientesService,
                        protected fb: UntypedFormBuilder,
                        protected usuariosService: UsuariosService,
                        protected authService: AuthService,
                        protected configuracionesSucursalService: ConfiguracionesSucursalService,
                        protected notasService: NotasService,
                        protected proveedoresService: ProveedoresService) {
    super(
      route, router, sucursalesService, loadingOverlayService, mensajeService,
      clientesService, fb, usuariosService, authService, configuracionesSucursalService,
      notasService, proveedoresService
    );
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getTiposDeNotasSucursal() {
    this.loadingOverlayService.activate();
    this.notasService.getTiposDeNotaCreditoSucursal(this.sucursalesService.getIdSucursal())
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        tipos => this.tiposNota = tipos,
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      )
    ;
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.notasService.buscarNotasCredito(terminos as BusquedaNotaCriteria);
  }

  verFactura(nota: Nota) {
    let idFactura = null;
    let path = '';

    if (nota.movimiento === Movimiento.VENTA) {
      idFactura = nota.idFacturaVenta;
      path = '/facturas-venta/ver';
    } else if (nota.movimiento === Movimiento.COMPRA) {
      idFactura = nota.idFacturaCompra;
      path = '/facturas-compra/ver';
    } else {
      return;
    }

    this.router.navigate([path, idFactura]);
  }
}
