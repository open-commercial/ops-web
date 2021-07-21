import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../services/sucursales.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {FormBuilder} from '@angular/forms';
import {NotasVentaComponent} from '../notas-venta/notas-venta.component';
import {ClientesService} from '../../services/clientes.service';
import {UsuariosService} from '../../services/usuarios.service';
import {AuthService} from '../../services/auth.service';
import {ConfiguracionesSucursalService} from '../../services/configuraciones-sucursal.service';
import {NotasService} from '../../services/notas.service';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {Observable} from 'rxjs';
import {Pagination} from '../../models/pagination';
import {BusquedaNotaCriteria} from '../../models/criterias/busqueda-nota-criteria';

@Component({
  selector: 'app-notas-debito-venta',
  templateUrl: './notas-debito-venta.component.html',
  styleUrls: ['./notas-debito-venta.component.scss']
})
export class NotasDebitoVentaComponent extends NotasVentaComponent implements OnInit {
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
    this.notasService.getTiposDeNotaDebitoSucursal(this.sucursalesService.getIdSucursal())
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        tipos => this.tiposNota = tipos,
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      )
    ;
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.notasService.buscarNotasDebito(terminos as BusquedaNotaCriteria);
  }
}
