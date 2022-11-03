import {Component, OnInit, ViewChild} from '@angular/core';
import {ListadoDirective} from '../../../../directives/listado.directive';
import {Observable} from 'rxjs';
import {Pagination} from '../../../../models/pagination';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../../../services/sucursales.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {Rol} from '../../../../models/rol';
import {AuthService} from '../../../../services/auth.service';
import {UntypedFormBuilder} from '@angular/forms';
import {BusquedaGastoCriteria} from '../../../../models/criterias/busqueda-gasto-criteria';
import * as moment from 'moment';
import {GastosService} from '../../../../services/gastos.service';
import {finalize, map} from 'rxjs/operators';
import {Usuario} from '../../../../models/usuario';
import {UsuariosService} from '../../../../services/usuarios.service';
import {HelperService} from '../../../../services/helper.service';
import {FormasDePagoService} from '../../../../services/formas-de-pago.service';
import {FormaDePago} from '../../../../models/forma-de-pago';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';
import {FiltroOrdenamientoComponent} from '../../../../components/filtro-ordenamiento/filtro-ordenamiento.component';
import {Gasto} from '../../../../models/gasto';
import {CajasService} from '../../../../services/cajas.service';

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html'
})
export class GastosComponent extends ListadoDirective implements OnInit {
  allowedRolesToSee: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToSee = false;

  allowedRolesToDelete: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToDelete = false;

  formasDePago: FormaDePago[] = [];

  ordenArray = [
    { val: 'fecha', text: 'Fecha Gasto' },
    { val: 'concepto', text: 'Concepto' },
    { val: 'idFormaDePago', text: 'Forma de Pago' },
    { val: 'monto', text: 'Monto' },
  ];

  sentidoArray = [
    { val: 'DESC', text: 'Descendente' },
    { val: 'ASC', text: 'Ascendente' },
  ];

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordenarPorG') ordenarPorGElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoG') sentidoGElement: FiltroOrdenamientoComponent;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              private authService: AuthService,
              private fb: UntypedFormBuilder,
              private gastosService: GastosService,
              private usuariosService: UsuariosService,
              private formasDePagoService: FormasDePagoService,
              private cajasService: CajasService,
              ) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.hasRoleToSee = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToSee);
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    if (!this.hasRoleToSee) {
      this.mensajeService.msg('No tiene permiso para ver el listado de gastos.');
      this.router.navigate(['/']);
    }
    this.getFormasDePago();
  }

  getFormasDePago() {
    this.loadingOverlayService.activate();
    this.formasDePagoService.getFormasDePago()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: value => this.formasDePago = value,
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

  populateFilterForm(ps) {
    super.populateFilterForm(ps);

    const aux = { desde: null, hasta: null };
    if (ps.fechaDesde) {
      const d = moment.unix(ps.fechaDesde).local();
      aux.desde = { year: d.year(), month: d.month() + 1, day: d.date() };
    }

    if (ps.fechaHasta) {
      const h = moment.unix(ps.fechaHasta).local();
      aux.hasta = { year: h.year(), month: h.month() + 1, day: h.date() };
    }

    this.filterForm.get('rangoFecha').setValue(aux);
  }

  getTerminosFromQueryParams(ps) {
    const terminos: BusquedaGastoCriteria = {
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: this.page,
    };

    const { orden, sentido } = this.getDefaultOrdenYSentido();
    const config = {
      idUsuario: { checkNaN: true },
      nroGasto: { checkNaN: true },
      idFormaDePago: { checkNaN: true },
      fechaDesde: { checkNaN: true, callback: HelperService.timestampToDate },
      fechaHasta: { checkNaN: true, callback: HelperService.timestampToDate },
      ordenarPor: { defaultValue: orden },
      sentido: { defaultValue: sentido },
    };

    return HelperService.paramsToTerminos<BusquedaGastoCriteria>(ps, config , terminos);
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.gastosService.buscar(terminos as BusquedaGastoCriteria);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      idUsuario: null,
      rangoFecha: null,
      concepto: '',
      nroGasto: null,
      idFormaDePago: null,
      ordenarPor: '',
      sentido: '',
    });
  }

  resetFilterForm() {
    this.filterForm.reset({
      idUsuario: null,
      rangoFecha: null,
      concepto: '',
      nroGasto: null,
      idFormaDePago: null,
      ordenarPor: '',
      sentido: '',
    });
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (values.idUsuario) {
      this.appliedFilters.push({ label: 'Usuario', value: values.idUsuario, asyncFn: this.getUsuarioInfoAsync(values.idUsuario) });
    }

    if (values.rangoFecha && values.rangoFecha.desde) {
      this.appliedFilters.push({
        label: 'Fecha (desde)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFecha.desde)
      });
    }

    if (values.rangoFecha && values.rangoFecha.hasta) {
      this.appliedFilters.push({
        label: 'Fecha (hasta)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFecha.hasta)
      });
    }

    if (values.concepto) {
      this.appliedFilters.push({ label: 'Concepto', value: values.concepto });
    }

    if (values.nroGasto) {
      this.appliedFilters.push({ label: 'Nro Gasto', value: values.nroGasto });
    }

    if (values.idFormaDePago) {
      const aux = this.formasDePago.filter((fp) => fp.idFormaDePago === Number(values.idFormaDePago));
      if (aux.length) {
        this.appliedFilters.push({ label: 'Forma de Pago',  value: aux[0].nombre });
      }
    }

    setTimeout(() => {
      this.ordenarPorAplicado = this.ordenarPorGElement ? this.ordenarPorGElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoGElement ? this.sentidoGElement.getTexto() : '';
    }, 500);
  }

  getUsuarioInfoAsync(id: number): Observable<string> {
    return this.usuariosService.getUsuario(id).pipe(map((u: Usuario) => u.nombre + ' ' + u.apellido));
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};

    if (values.idUsuario) { ret.idUsuario = values.idUsuario; }

    if (values.rangoFecha && values.rangoFecha.desde) {
      ret.fechaDesde = HelperService.getUnixDateFromNgbDate(values.rangoFecha.desde);
    }

    if (values.rangoFecha && values.rangoFecha.hasta) {
      ret.fechaHasta = HelperService.getUnixDateFromNgbDate(values.rangoFecha.hasta);
    }

    if (values.concepto) { ret.concepto = values.concepto; }
    if (values.nroGasto) { ret.nroGasto = values.nroGasto; }
    if (values.idFormaDePago) { ret.idFormaDePago = values.idFormaDePago; }

    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
  }

  nuevoGasto() {
    this.cajasService.estaAbiertaLaCaja()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: value => {
          if (value) {
            this.router.navigate(['/gastos/nuevo']);
          } else {
            this.mensajeService.msg('La operación solicitada no se puede realizar. La caja se encuentra cerrada', MensajeModalType.ERROR);
          }
        },
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

  verGasto(g: Gasto) {
    this.router.navigate(['/gastos/ver', g.idGasto]);
  }

  eliminarGasto(g: Gasto) {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('No posee permiso para eliminar el gasto', MensajeModalType.ERROR);
      return;
    }
    const msg = `¿Está seguro que desea eliminar / anular el gasto seleccionado?`;
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.gastosService.eliminarGasto(g.idGasto)
          // .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: () => location.reload(),
            error: err => {
              this.loadingOverlayService.deactivate();
              this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            },
          })
        ;
      }
    }, () => { return; });
  }
}
