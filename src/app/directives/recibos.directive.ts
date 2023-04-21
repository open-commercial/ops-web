import { TotalData } from './../components/totales/totales.component';
import {Directive, OnInit, ViewChild} from '@angular/core';
import {ListadoDirective} from './listado.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../services/sucursales.service';
import {LoadingOverlayService} from '../services/loading-overlay.service';
import {MensajeService} from '../services/mensaje.service';
import {UntypedFormBuilder} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RecibosService} from '../services/recibos.service';
import {FormasDePagoService} from '../services/formas-de-pago.service';
import {UsuariosService} from '../services/usuarios.service';
import {AuthService} from '../services/auth.service';
import {ConfiguracionesSucursalService} from '../services/configuraciones-sucursal.service';
import {NotasService} from '../services/notas.service';
import {Rol} from '../models/rol';
import {HelperService} from '../services/helper.service';
import {FormaDePago} from '../models/forma-de-pago';
import {FiltroOrdenamientoComponent} from '../components/filtro-ordenamiento/filtro-ordenamiento.component';
import {TipoDeComprobante} from '../models/tipo-de-comprobante';
import {finalize, map} from 'rxjs/operators';
import {MensajeModalType} from '../components/mensaje-modal/mensaje-modal.component';
import {BusquedaReciboCriteria} from '../models/criterias/busqueda-recibo-criteria';
import {Movimiento} from '../models/movimiento';
import * as moment from 'moment';
import {Observable} from 'rxjs';
import {Pagination} from '../models/pagination';
import {Usuario} from '../models/usuario';
import {Nota} from '../models/nota';

@Directive()
export abstract class RecibosDirective extends ListadoDirective implements OnInit {
  allowedRolesToSee: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR];
  hasRoleToSee = false;

  allowedRolesToDelete: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToDelete = false;

  allowedRolesToCrearNota: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToCrearNota = false;

  allowedRolesToSeeTotal = [Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR];
  hasRoleToSeeTotal = false;

  helper = HelperService;
  formasDePago: FormaDePago[] = [];

  ordenArray = [
    { val: 'fecha', text: 'Fecha Recibo' },
    { val: 'concepto', text: 'Concepto' },
    { val: 'idFormaDePago', text: 'Forma de Pago' },
    { val: 'monto', text: 'Monto' },
  ];

  sentidoArray = [
    { val: 'DESC', text: 'Descendente' },
    { val: 'ASC', text: 'Ascendente' },
  ];

  rol = Rol;

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordenarPorR') ordenarPorRElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoR') sentidoRElement: FiltroOrdenamientoComponent;

  tiposDeComprobantesParaAutorizacion: TipoDeComprobante[] = [
    TipoDeComprobante.NOTA_CREDITO_A,
    TipoDeComprobante.NOTA_CREDITO_B,
    TipoDeComprobante.NOTA_CREDITO_C,
    TipoDeComprobante.NOTA_DEBITO_A,
    TipoDeComprobante.NOTA_DEBITO_B,
    TipoDeComprobante.NOTA_DEBITO_C,
  ];

  loadingTotal = false;
  totalesData: TotalData[] = [
    { label: 'Total', data: 0, hasRole: false },
  ];

  protected constructor(protected route: ActivatedRoute,
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
                        protected notasService: NotasService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
    this.hasRoleToSee = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToSee);
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    this.hasRoleToCrearNota = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCrearNota);
    this.hasRoleToSeeTotal = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToSeeTotal);

    this.totalesData[0].hasRole = this.hasRoleToSeeTotal;
  }

  abstract getMovimiento(): Movimiento;

  ngOnInit(): void {
    if (!this.hasRoleToSee) {
      this.mensajeService.msg('No tiene permiso para ver el listado de recibos de ' + this.getMovimiento() + '.');
      this.router.navigate(['/']);
      return;
    }
    super.ngOnInit();
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
    const terminos: BusquedaReciboCriteria = {
      movimiento: this.getMovimiento(),
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: this.page,
    };

    const { orden, sentido } = this.getDefaultOrdenYSentido();
    const config = {
      fechaDesde: { checkNaN: true, callback: HelperService.timestampToDate },
      fechaHasta: { checkNaN: true, callback: HelperService.timestampToDate },
      idFormaDePago: { checkNaN: true },
      idUsuario: { checkNaN: true },
      idViajante: { checkNaN: true },
      ordenarPor: { defaultValue: orden },
      sentido: { defaultValue: sentido },
    };

    return HelperService.paramsToTerminos<BusquedaReciboCriteria>(ps, config , terminos);
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.recibosService.buscar(terminos as BusquedaReciboCriteria);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      rangoFecha: null,
      numSerie: null,
      numRecibo: null,
      concepto: '',
      idFormaDePago: null,
      idUsuario: null,
      idViajante: null,
      ordenarPor: '',
      sentido: '',
    });
  }

  resetFilterForm() {
    this.filterForm.reset({
      rangoFecha: null,
      numSerie: null,
      numRecibo: null,
      concepto: '',
      idFormaDePago: null,
      idUsuario: null,
      idViajante: null,
      ordenarPor: '',
      sentido: '',
    });
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

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

    if (values.numSerie || values.numRecibo) {
      let ns = null;
      let nf = null;
      if (values.numSerie) {
        ns = Number(values.numSerie);
        ns = !isNaN(ns) ? ns : null;
      }
      if (values.numRecibo) {
        nf = Number(values.numRecibo);
        nf = !isNaN(nf) ? nf : null;
      }

      if (ns || nf) { this.appliedFilters.push({ label: 'Nº Recibo', value: this.helper.formatNumFactura(ns, nf) }); }
    }

    if (values.concepto) {
      this.appliedFilters.push({ label: 'Concepto', value: values.concepto });
    }

    if (values.idUsuario) {
      this.appliedFilters.push({ label: 'Usuario', value: values.idUsuario, asyncFn: this.getUsuarioInfoAsync(values.idUsuario) });
    }

    if (values.idViajante) {
      this.appliedFilters.push({ label: 'Viajante', value: values.idViajante, asyncFn: this.getUsuarioInfoAsync(values.idViajante) });
    }

    if (values.idFormaDePago) {
      const aux = this.formasDePago.filter((fp) => fp.idFormaDePago === Number(values.idFormaDePago));
      if (aux.length) {
        this.appliedFilters.push({ label: 'Forma de Pago',  value: aux[0].nombre });
      }
    }

    setTimeout(() => {
      this.ordenarPorAplicado = this.ordenarPorRElement ? this.ordenarPorRElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoRElement ? this.sentidoRElement.getTexto() : '';
    }, 500);
  }

  getUsuarioInfoAsync(id: number): Observable<string> {
    return this.usuariosService.getUsuario(id).pipe(map((u: Usuario) => u.nombre + ' ' + u.apellido));
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};

    if (values.rangoFecha && values.rangoFecha.desde) {
      ret.fechaDesde = HelperService.getUnixDateFromNgbDate(values.rangoFecha.desde);
    }

    if (values.rangoFecha && values.rangoFecha.hasta) {
      ret.fechaHasta = HelperService.getUnixDateFromNgbDate(values.rangoFecha.hasta);
    }

    if (values.numSerie) { ret.numSerie = values.numSerie; }
    if (values.numRecibo) { ret.numRecibo = values.numRecibo; }
    if (values.concepto) { ret.concepto = values.concepto; }
    if (values.idFormaDePago) { ret.idFormaDePago = values.idFormaDePago; }
    if (values.idUsuario) { ret.idUsuario = values.idUsuario; }
    if (values.idViajante) { ret.idViajante = values.idViajante; }

    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
  }

  protected showNotaCreationSuccessMessage(nota: Nota, message: string, callback: () => void = () => { return; }) {
    if (nota.idNota) {
      this.mensajeService.msg(message, MensajeModalType.INFO).then(
        () => {
          if (this.tiposDeComprobantesParaAutorizacion.indexOf(nota.tipoComprobante) >= 0) {
            callback();
          }
        }
      );
    } else {
      throw new Error('La Nota no posee id');
    }
  }

  getItems(terminos: BusquedaReciboCriteria) {
    super.getItems(terminos);
    if (this.hasRoleToSeeTotal) {
      this.loadingTotal = true;
      this.recibosService.total(terminos)
        .pipe(finalize(() => this.loadingTotal = false))
        .subscribe({
          next: (total: number) => this.totalesData[0].data = Number(total),
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }
}
