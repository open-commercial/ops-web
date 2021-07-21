import { Component, OnInit } from '@angular/core';
import {NotasVentaComponent} from '../notas-venta/notas-venta.component';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../services/sucursales.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {ClientesService} from '../../services/clientes.service';
import {FormBuilder} from '@angular/forms';
import {UsuariosService} from '../../services/usuarios.service';
import {AuthService} from '../../services/auth.service';
import {ConfiguracionesSucursalService} from '../../services/configuraciones-sucursal.service';
import {NotasService} from '../../services/notas.service';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {Observable} from 'rxjs';
import {Pagination} from '../../models/pagination';
import {BusquedaNotaCriteria} from '../../models/criterias/busqueda-nota-criteria';
import {Nota} from '../../models/nota';

@Component({
  selector: 'app-notas-credito-venta',
  templateUrl: './notas-credito-venta.component.html',
  styleUrls: ['./notas-credito-venta.component.scss']
})
export class NotasCreditoVentaComponent extends NotasVentaComponent implements OnInit {

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected clientesService: ClientesService,
              protected fb: FormBuilder,
              protected usuariosService: UsuariosService,
              protected authService: AuthService,
              protected configuracionesSucursalService: ConfiguracionesSucursalService,
              protected notasService: NotasService) {
    super(
      route, router, sucursalesService, loadingOverlayService, mensajeService,
      clientesService, fb, usuariosService, authService, configuracionesSucursalService, notasService
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
    if (nota.idFacturaVenta) {
      this.router.navigate(['/facturas-venta/ver', nota.idFacturaVenta]);
    }
  }
}
