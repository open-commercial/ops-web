import { OnInit, ViewChild, Directive } from '@angular/core';
import {ListadoBaseComponent} from '../listado-base.component';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../services/sucursales.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {Observable} from 'rxjs';
import {Pagination} from '../../models/pagination';
import {BusquedaNotaCriteria} from '../../models/criterias/busqueda-nota-criteria';
import {FormBuilder} from '@angular/forms';
import * as moment from 'moment';
import {FiltroOrdenamientoComponent} from '../filtro-ordenamiento/filtro-ordenamiento.component';
import {HelperService} from '../../services/helper.service';
import {finalize, map} from 'rxjs/operators';
import {Usuario} from '../../models/usuario';
import {UsuariosService} from '../../services/usuarios.service';
import {Rol} from '../../models/rol';
import {TipoDeComprobante} from '../../models/tipo-de-comprobante';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {Movimiento} from '../../models/movimiento';
import {AuthService} from '../../services/auth.service';
import {Nota} from '../../models/nota';
import {ConfiguracionesSucursalService} from '../../services/configuraciones-sucursal.service';
import {NotasService} from '../../services/notas.service';
import {Proveedor} from '../../models/proveedor';
import {ProveedoresService} from '../../services/proveedores.service';

/** NO ES COMPONENT YA QUE ES UNA CLASE ABSTRACTA */
@Directive()
export abstract class NotasComponent extends ListadoBaseComponent implements OnInit {
  rol = Rol;
  ordenarPorOptionsN = [];

  sentidoOptionsN = [
    { val: 'ASC', text: 'Ascendente' },
    { val: 'DESC', text: 'Descendente' },
  ];

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordernarPorN') ordenarPorNElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoN') sentidoNElement: FiltroOrdenamientoComponent;

  helper = HelperService;
  tiposNota: TipoDeComprobante[] = [];

  allowedRolesToAutorizar: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRoleToAutorizar = false;

  allowedRolesToVerDetalle: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRoleToVerDetalle = false;

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR ];
  hasRoleToDelete = false;

  tiposDeComprobantesParaAutorizacion: TipoDeComprobante[] = [
    TipoDeComprobante.NOTA_CREDITO_A,
    TipoDeComprobante.NOTA_CREDITO_B,
    TipoDeComprobante.NOTA_CREDITO_C,
    TipoDeComprobante.NOTA_DEBITO_A,
    TipoDeComprobante.NOTA_DEBITO_B,
    TipoDeComprobante.NOTA_DEBITO_C,
  ];

  protected allowedMovimientos = [Movimiento.COMPRA, Movimiento.VENTA];

  protected constructor(protected route: ActivatedRoute,
                        protected router: Router,
                        protected sucursalesService: SucursalesService,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService,
                        protected clientesService: ClientesService,
                        protected fb: FormBuilder,
                        protected usuariosService: UsuariosService,
                        protected authService: AuthService,
                        protected configuracionesSucursalService: ConfiguracionesSucursalService,
                        protected notasService: NotasService,
                        protected proveedoresService: ProveedoresService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
    this.fillOrdenarPorOptions();
    if (this.allowedMovimientos.indexOf(this.getMovimiento()) < 0) {
      throw new Error('El movimiento configurado no está permitido');
    }
  }

  ngOnInit() {
    super.ngOnInit();
    this.getTiposDeNotasSucursal();
    this.hasRoleToAutorizar = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToAutorizar);
    this.hasRoleToVerDetalle = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToVerDetalle);
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
  }

  fillOrdenarPorOptions() {
    this.ordenarPorOptionsN.push({ val: 'fecha', text: 'Fecha' });

    if (this.getMovimiento() === Movimiento.VENTA) {
      this.ordenarPorOptionsN.push({ val: 'cliente.idCliente', text: 'Cliente' });
    }

    if (this.getMovimiento() === Movimiento.COMPRA) {
      this.ordenarPorOptionsN.push({ val: 'proveedor.razonSocial', text: 'Proveedor' });
    }

    this.ordenarPorOptionsN.push({ val: 'total', text: 'Total' });
  }

  abstract getTiposDeNotasSucursal();
  abstract getMovimiento(): Movimiento;

  getTerminosFromQueryParams(ps) {
    const terminos: BusquedaNotaCriteria = {
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: this.page,
      movimiento: this.getMovimiento(),
    };

    if (this.getMovimiento() === Movimiento.VENTA) {
      if (ps.idCliente && !isNaN(ps.idCliente)) {
        this.filterForm.get('idCliente').setValue(Number(ps.idCliente));
        terminos.idCliente = Number(ps.idCliente);
      }
      if (ps.idViajante && !isNaN(ps.idViajante)) {
        this.filterForm.get('idViajante').setValue(Number(ps.idViajante));
        terminos.idViajante = Number(ps.idViajante);
      }
    }

    if (this.getMovimiento() === Movimiento.COMPRA) {
      if (ps.idProveedor && !isNaN(ps.idProveedor)) {
        this.filterForm.get('idProveedor').setValue(Number(ps.idProveedor));
        terminos.idProveedor = Number(ps.idProveedor);
      }
    }

    if (ps.idUsuario && !isNaN(ps.idUsuario)) {
      this.filterForm.get('idUsuario').setValue(Number(ps.idUsuario));
      terminos.idUsuario = Number(ps.idUsuario);
    }

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

    if (ps.tipoNota) {
      this.filterForm.get('tipoNota').setValue(ps.tipoNota);
      terminos.tipoComprobante = ps.tipoNota;
    }

    if (ps.numSerie) {
      this.filterForm.get('numSerie').setValue(ps.numSerie);
      terminos.numSerie = Number(ps.numSerie);
    }

    if (ps.numNota) {
      this.filterForm.get('numNota').setValue(ps.numNota);
      terminos.numNota = Number(ps.numNota);
    }

    let ordenarPorVal = this.ordenarPorOptionsN.length ? this.ordenarPorOptionsN[0].val : '';
    if (ps.ordenarPor) { ordenarPorVal = ps.ordenarPor; }
    this.filterForm.get('ordenarPor').setValue(ordenarPorVal);
    terminos.ordenarPor = ordenarPorVal;

    const sentidoVal = ps.sentido ? ps.sentido : 'DESC';
    this.filterForm.get('sentido').setValue(sentidoVal);
    terminos.sentido = sentidoVal;

    return terminos;
  }

  abstract getItemsObservableMethod(terminos): Observable<Pagination>;

  createFilterForm() {
    const controlsConfigs: { [key: string]: any } = {
      idUsuario: null,
      rangoFecha: null,
      tipoNota: null,
      numSerie: null,
      numNota: '',
      ordenarPor: null,
      sentido: null,
    };

    if (this.getMovimiento() === Movimiento.VENTA) {
      controlsConfigs.idCliente = null;
      controlsConfigs.idViajante = null;
    }

    if (this.getMovimiento() === Movimiento.COMPRA) {
      controlsConfigs.idProveedor = null;
    }

    this.filterForm = this.fb.group(controlsConfigs);
  }

  resetFilterForm() {
    const value: { [key: string]: any } = {
      idUsuario: null,
      rangoFecha: null,
      tipoNota: null,
      numSerie: null,
      numNota: '',
      ordenarPor: null,
      sentido: null,
    };

    if (this.getMovimiento() === Movimiento.VENTA) {
      value.idCliente = null;
      value.idViajante = null;
    }

    if (this.getMovimiento() === Movimiento.COMPRA) {
      value.idProveedor = null;
    }

    this.filterForm.reset(value);
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (this.getMovimiento() === Movimiento.VENTA) {
      if (values.idCliente) {
        this.appliedFilters.push({ label: 'Cliente', value: values.idCliente, asyncFn: this.getClienteInfoAsync(values.idCliente) });
      }
      if (values.idViajante) {
        this.appliedFilters.push({ label: 'Viajante', value: values.idViajante, asyncFn: this.getUsuarioInfoAsync(values.idViajante) });
      }
    }

    if (this.getMovimiento() === Movimiento.COMPRA) {
      if (values.idProveedor) {
        this.appliedFilters.push(
          { label: 'Proveedor', value: values.idProveedor, asyncFn: this.getProveedorInfoAsync(values.idProveedor) }
        );
      }
    }

    if (values.idUsuario) {
      this.appliedFilters.push({ label: 'Usuario', value: values.idUsuario, asyncFn: this.getUsuarioInfoAsync(values.idUsuario) });
    }


    if (values.rangoFecha && values.rangoFecha.desde) {
      this.appliedFilters.push({
        label: 'Fecha (desde)', value: this.helper.getFormattedDateFromNgbDate(values.rangoFecha.desde)
      });
    }

    if (values.rangoFecha && values.rangoFecha.hasta) {
      this.appliedFilters.push({
        label: 'Fecha (hasta)', value: this.helper.getFormattedDateFromNgbDate(values.rangoFecha.hasta)
      });
    }

    if (values.tipoNota) {
      this.appliedFilters.push({ label: 'Tipo de Nota', value: this.helper.tipoComprobanteLabel(values.tipoNota) });
    }

    if (values.numSerie || values.numNota) {
      let ns = null;
      let nn = null;
      if (values.numSerie) {
        ns = Number(values.numSerie);
        ns = !isNaN(ns) ? ns : null;
      }
      if (values.numNota) {
        nn = Number(values.numNota);
        nn = !isNaN(nn) ? nn : null;
      }

      if (ns || nn) { this.appliedFilters.push({ label: 'Nº Nota Crédito', value: this.helper.formatNumFactura(ns, nn) }); }
    }

    setTimeout(() => {
      this.ordenarPorAplicado = this.ordenarPorNElement ? this.ordenarPorNElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoNElement ? this.sentidoNElement.getTexto() : '';
    }, 500);
  }

  getClienteInfoAsync(id: number): Observable<string> {
    return this.clientesService.getCliente(id).pipe(map((c: Cliente) => c.nombreFiscal));
  }

  getUsuarioInfoAsync(id: number): Observable<string> {
    return this.usuariosService.getUsuario(id).pipe(map((u: Usuario) => u.nombre + ' ' + u.apellido));
  }

  getProveedorInfoAsync(id: number): Observable<string> {
    return this.proveedoresService.getProveedor(id).pipe(map((p: Proveedor) => p.razonSocial));
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};
    ret.movimiento = this.getMovimiento();

    if (this.getMovimiento() === Movimiento.VENTA) {
      if (values.idCliente) { ret.idCliente = values.idCliente; }
      if (values.idViajante) { ret.idViajante = values.idViajante; }
    }

    if (this.getMovimiento() === Movimiento.COMPRA) {
      if (values.idProveedor) { ret.idProveedor = values.idProveedor; }
    }

    if (values.idUsuario) { ret.idUsuario = values.idUsuario; }
    if (values.rangoFecha && values.rangoFecha.desde) {
      ret.fechaDesde = this.helper.getUnixDateFromNgbDate(values.rangoFecha.desde); }
    if (values.rangoFecha && values.rangoFecha.hasta) {
      ret.fechaHasta = this.helper.getUnixDateFromNgbDate(values.rangoFecha.hasta); }
    if (values.tipoNota) { ret.tipoNota = values.tipoNota; }
    if (values.numSerie) { ret.numSerie = values.numSerie; }
    if (values.numNota) { ret.numNota = values.numNota; }
    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
  }

  autorizar(nota: Nota) {
    if (!this.hasRoleToAutorizar) {
      this.mensajeService.msg('No posee permiso para autorizar la nota.', MensajeModalType.ERROR);
      return;
    }

    if (this.tiposDeComprobantesParaAutorizacion.indexOf(nota.tipoComprobante) < 0) {
      this.mensajeService.msg('El tipo de movimiento seleccionado no corresponde con la operación solicitada.', MensajeModalType.ERROR);
      return;
    }

    this.loadingOverlayService.activate();
    this.configuracionesSucursalService.isFacturaElectronicaHabilitada()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        habilitada => {
          if (habilitada) {
            this.loadingOverlayService.activate();
            this.notasService.autorizar(nota.idNota)
              .pipe(finalize(() => this.loadingOverlayService.deactivate()))
              .subscribe(
                () => this.mensajeService.msg('La Nota fue autorizada por AFIP correctamente!', MensajeModalType.INFO),
                err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
              )
            ;
          } else {
            this.mensajeService.msg('La funcionalidad de Factura Electronica no se encuentra habilitada.', MensajeModalType.ERROR);
          }
        },
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      )
    ;
  }

  verDetalle(nota: Nota) {
    if (!this.hasRoleToVerDetalle) {
      this.mensajeService.msg('No posee permiso para ver la nota.', MensajeModalType.ERROR);
      return;
    }

    let path = '';
    if (nota.movimiento === Movimiento.VENTA) {
       path = nota.type === 'NotaCredito' ? '/notas-credito-venta/ver' : '/notas-debito-venta/ver';
    } else if (nota.movimiento === Movimiento.COMPRA) {
       path = nota.type === 'NotaCredito' ? '/notas-credito-compra/ver' : '/notas-debito-compra/ver';
    } else {
       return;
    }

    this.router.navigate([path, nota.idNota]);
  }

  eliminar(nota) {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('No posee permiso para eliminar la nota.', MensajeModalType.ERROR);
      return;
    }

    const msg = 'Esta seguro que desea eliminar la nota seleccionada?';
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.notasService.eliminar(nota.idNota)
          // No se hace pipe finalize porque se hace ur reload
          .subscribe(
            () => location.reload(),
            err => {
              this.loadingOverlayService.deactivate();
              this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            },
          )
        ;
      }
    });
  }
}
