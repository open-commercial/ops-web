import {Component, OnInit, ViewChild} from '@angular/core';
import {ListadoBaseDirective} from '../../../components/listado-base.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../../services/sucursales.service';
import {LoadingOverlayService} from '../../../services/loading-overlay.service';
import {MensajeService} from '../../../services/mensaje.service';
import {Observable} from 'rxjs';
import {Pagination} from '../../../models/pagination';
import {FormBuilder} from '@angular/forms';
import {RecibosService} from '../../../services/recibos.service';
import {BusquedaReciboCriteria} from '../../../models/criterias/busqueda-recibo-criteria';
import {Movimiento} from '../../../models/movimiento';
import * as moment from 'moment';
import {HelperService} from '../../../services/helper.service';
import {FormaDePago} from '../../../models/forma-de-pago';
import {finalize, map} from 'rxjs/operators';
import {MensajeModalType} from '../../../components/mensaje-modal/mensaje-modal.component';
import {FormasDePagoService} from '../../../services/formas-de-pago.service';
import {Cliente} from '../../../models/cliente';
import {Usuario} from '../../../models/usuario';
import {ClientesService} from '../../../services/clientes.service';
import {UsuariosService} from '../../../services/usuarios.service';
import {FiltroOrdenamientoComponent} from '../../../components/filtro-ordenamiento/filtro-ordenamiento.component';
import {Rol} from '../../../models/rol';
import {Recibo} from '../../../models/recibo';
import {AuthService} from '../../../services/auth.service';
import {
  NotaDebitoVentaReciboModalComponent
} from '../../../components/nota-debito-venta-recibo-modal/nota-debito-venta-recibo-modal.component';
import {NuevaNotaDebitoDeRecibo} from '../../../models/nueva-nota-debito-de-recibo';
import {Nota, NotaDebito} from '../../../models/nota';
import {
  NotaDebitoVentaDetalleReciboModalComponent
} from '../../../components/nota-debito-venta-detalle-recibo-modal/nota-debito-venta-detalle-recibo-modal.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TipoDeComprobante} from '../../../models/tipo-de-comprobante';
import {ConfiguracionesSucursalService} from '../../../services/configuraciones-sucursal.service';
import {NotasService} from '../../../services/notas.service';

@Component({
  selector: 'app-recibos-venta',
  templateUrl: './recibos-venta.component.html'
})
export class RecibosVentaComponent extends ListadoBaseDirective implements OnInit {
  allowedRolesToSee: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR];
  hasRoleToSee = false;

  allowedRolesToDelete: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToDelete = false;

  allowedRolesToCrearNota: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToCrearNota = false;

  helper = HelperService;
  formasDePago: FormaDePago[] = [];

  ordenarPorOptionsRV = [
    { val: 'fecha', text: 'Fecha Recibo' },
    { val: 'concepto', text: 'Concepto' },
    { val: 'idFormaDePago', text: 'Forma de Pago' },
    { val: 'monto', text: 'Monto' },
  ];

  sentidoOptionsRV = [
    { val: 'DESC', text: 'Descendente' },
    { val: 'ASC', text: 'Ascendente' },
  ];

  rol = Rol;

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordenarPorRV') ordenarPorRVElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoRV') sentidoRVElement: FiltroOrdenamientoComponent;

  tiposDeComprobantesParaAutorizacion: TipoDeComprobante[] = [
    TipoDeComprobante.NOTA_CREDITO_A,
    TipoDeComprobante.NOTA_CREDITO_B,
    TipoDeComprobante.NOTA_CREDITO_C,
    TipoDeComprobante.NOTA_DEBITO_A,
    TipoDeComprobante.NOTA_DEBITO_B,
    TipoDeComprobante.NOTA_DEBITO_C,
  ];

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              private fb: FormBuilder,
              private modalService: NgbModal,
              private recibosService: RecibosService,
              private formasDePagoService: FormasDePagoService,
              private clientesService: ClientesService,
              private usuariosService: UsuariosService,
              private authService: AuthService,
              private configuracionesSucursalService: ConfiguracionesSucursalService,
              private notasService: NotasService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.hasRoleToSee = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToSee);
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    this.hasRoleToCrearNota = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCrearNota);
    if (!this.hasRoleToSee) {
      this.mensajeService.msg('No tiene permiso para ver el listado de recibos de venta.');
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

  getTerminosFromQueryParams(ps) {
    const terminos: BusquedaReciboCriteria = {
      movimiento: Movimiento.VENTA,
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: this.page,
    };

    if (ps.fechaDesde || ps.fechaHasta) {
      const aux = { desde: null, hasta: null };

      if (ps.fechaDesde) {
        const d = moment.unix(ps.fechaDesde).local();
        aux.desde = { year: d.year(), month: d.month() + 1, day: d.date() };
        terminos.fechaDesde = d.toDate();
      }

      if (ps.fechaHasta) {
        const h = moment.unix(ps.fechaHasta).local();
        aux.hasta = { year: h.year(), month: h.month() + 1, day: h.date() };
        terminos.fechaHasta = h.toDate();
      }

      this.filterForm.get('rangoFecha').setValue(aux);
    }

    if (ps.numSerie) {
      this.filterForm.get('numSerie').setValue(ps.numSerie);
      terminos.numSerie = Number(ps.numSerie);
    }

    if (ps.numRecibo) {
      this.filterForm.get('numRecibo').setValue(ps.numRecibo);
      terminos.numRecibo = Number(ps.numRecibo);
    }

    if (ps.concepto) {
      this.filterForm.get('concepto').setValue(ps.concepto);
      terminos.concepto = ps.concepto;
    }

    if (ps.idFormaDePago && !isNaN(ps.idFormaDePago)) {
      this.filterForm.get('idFormaDePago').setValue(ps.idFormaDePago);
      terminos.idFormaDePago = ps.idFormaDePago;
    }

    if (ps.idUsuario && !isNaN(ps.idUsuario)) {
      this.filterForm.get('idUsuario').setValue(Number(ps.idUsuario));
      terminos.idUsuario = Number(ps.idUsuario);
    }

    if (ps.idViajante && !isNaN(ps.idViajante)) {
      this.filterForm.get('idViajante').setValue(Number(ps.idViajante));
      terminos.idViajante = Number(ps.idViajante);
    }

    let ordenarPorVal = this.ordenarPorOptionsRV.length ? this.ordenarPorOptionsRV[0].val : '';
    if (ps.ordenarPor) { ordenarPorVal = ps.ordenarPor; }
    this.filterForm.get('ordenarPor').setValue(ordenarPorVal);
    terminos.ordenarPor = ordenarPorVal;

    const sentidoVal = ps.sentido ? ps.sentido : 'DESC';
    this.filterForm.get('sentido').setValue(sentidoVal);
    terminos.sentido = sentidoVal;

    return terminos;
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
      idCliente: null,
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
      idCliente: null,
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

    if (values.idCliente) {
      this.appliedFilters.push({ label: 'Cliente', value: values.idCliente, asyncFn: this.getClienteInfoAsync(values.idCliente) });
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

  }

  getClienteInfoAsync(id: number): Observable<string> {
    return this.clientesService.getCliente(id).pipe(map((c: Cliente) => c.nombreFiscal));
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
    if (values.numRecibo) { ret.numFactura = values.numRecibo; }
    if (values.concepto) { ret.concepto = values.concepto; }
    if (values.idFormaDePago) { ret.idFormaDePago = values.idFormaDePago; }
    if (values.idCliente) { ret.idCliente = values.idCliente; }
    if (values.idUsuario) { ret.idUsuario = values.idUsuario; }
    if (values.idViajante) { ret.idViajante = values.idViajante; }

    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
  }

  verRecibo(r: Recibo) {
    this.router.navigate(['/recibos/ver', r.idRecibo]);
  }

  eliminarRecibo(r: Recibo) {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('No posee permiso para eliminar recibos.', MensajeModalType.ERROR);
      return;
    }

    const msg = 'Esta seguro que desea eliminar el recibo seleccionado?';
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.recibosService.eliminarRecibo(r.idRecibo)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: () => this.loadPage(this.page),
            error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
          })
        ;
      }
    });
  }

  crearNotaDeDebitoRecibo(r: Recibo) {
    if (!this.hasRoleToCrearNota) {
      this.mensajeService.msg('No posee permisos para crear notas.', MensajeModalType.ERROR);
      return;
    }

    this.doCrearNotaDebitoRecibo(r);
  }

  doCrearNotaDebitoRecibo(r: Recibo) {
    this.loadingOverlayService.activate();
    this.clientesService.getCliente(r.idCliente)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (c: Cliente) => {
          const modalRef = this.modalService.open(NotaDebitoVentaReciboModalComponent, { backdrop: 'static' });
          modalRef.componentInstance.cliente = c;
          modalRef.componentInstance.idRecibo = r.idRecibo;
          modalRef.result
            .then((data: [NuevaNotaDebitoDeRecibo, NotaDebito]) => {
              const modalRef2 = this.modalService.open(NotaDebitoVentaDetalleReciboModalComponent, { backdrop: 'static', size: 'lg' });
              modalRef2.componentInstance.nnddr = data[0];
              modalRef2.componentInstance.notaDebito = data[1];
              modalRef2.componentInstance.cliente = c;
              modalRef2.result.then(
                (nota: NotaDebito) => this.showNotaCreationSuccessMessage(nota, 'Nota de Débito creada correctamente.'),
                () => { return; }
              );
            }, () => { return; })
          ;
        },
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      });
  }

  private showNotaCreationSuccessMessage(nota: Nota, message: string) {
    if (nota.idNota) {
      this.mensajeService.msg(message, MensajeModalType.INFO).then(
        () => {
          if (this.tiposDeComprobantesParaAutorizacion.indexOf(nota.tipoComprobante) >= 0) {
            this.doAutorizar(nota.idNota, () => this.loadPage(1));
          } else {
            this.loadPage(1);
          }
        }
      );
    } else {
      throw new Error('La Nota no posee id');
    }
  }

  doAutorizar(idNota: number, callback = () => { return; }) {
    this.loadingOverlayService.activate();
    this.configuracionesSucursalService.isFacturaElectronicaHabilitada()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: habilitada => {
          if (habilitada) {
            this.loadingOverlayService.activate();
            this.notasService.autorizar(idNota)
              .pipe(finalize(() => this.loadingOverlayService.deactivate()))
              .subscribe({
                next: () => this.mensajeService.msg('La Nota fue autorizada por AFIP correctamente!', MensajeModalType.INFO)
                  .then(() => callback()),
                error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
                  .then(() => callback()),
              })
            ;
          } else {
            this.mensajeService.msg('La funcionalidad de Factura Electronica no se encuentra habilitada.', MensajeModalType.ERROR);
          }
        },
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      });
  }
}
