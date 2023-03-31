import { TotalData } from './../components/totales/totales.component';
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
import { Observable, combineLatest } from 'rxjs';
import {Pagination} from '../models/pagination';
import {BusquedaNotaCriteria} from '../models/criterias/busqueda-nota-criteria';
import {ProveedoresService} from '../services/proveedores.service';

@Directive()
export abstract class NotasCreditoDirective extends NotasDirective implements OnInit {

  loadingTotalizadores = false;
  totalesData: TotalData[] = [
    { label: 'Total IVA Crédito', data: 0, hasRole: false },
    { label: 'Total Crédito', data: 0, hasRole: false },
  ];

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

    this.totalesData[0].hasRole = this.hasRoleToSeeTotales;
    this.totalesData[1].hasRole = this.hasRoleToSeeTotales;
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getTiposDeNotasSucursal() {
    this.loadingOverlayService.activate();
    this.notasService.getTiposDeNotaCreditoSucursal(this.sucursalesService.getIdSucursal())
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: tipos => this.tiposNota = tipos,
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.notasService.buscarNotasCredito(terminos as BusquedaNotaCriteria);
  }

  getItems(terminos: BusquedaNotaCriteria) {
    super.getItems(terminos);
    if (this.hasRoleToSeeTotales) {
      this.loadingTotalizadores = true;
      const obvs = [
        this.notasService.totalIvaCredito(terminos),
        this.notasService.totalCredito(terminos),
      ];
      combineLatest(obvs)
        .pipe(finalize(() => this.loadingTotalizadores = false))
        .subscribe({
          next: (data: [number, number]) => {
            this.totalesData[0].data = Number(data[0]);
            this.totalesData[1].data = Number(data[1]);
          },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }
}
