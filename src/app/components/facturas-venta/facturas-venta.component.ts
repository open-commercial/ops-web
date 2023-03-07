import { TotalData } from './../totales/totales.component';
import {Component, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder} from '@angular/forms';
import {Rol} from '../../models/rol';
import {HelperService} from '../../services/helper.service';
import {Pagination} from '../../models/pagination';
import {finalize, map} from 'rxjs/operators';
import {FacturasVentaService} from '../../services/facturas-venta.service';
import {TipoDeComprobante} from '../../models/tipo-de-comprobante';
import {BusquedaFacturaVentaCriteria} from '../../models/criterias/busqueda-factura-venta-criteria';
import {SucursalesService} from '../../services/sucursales.service';
import {ActivatedRoute, Router} from '@angular/router';
import * as moment from 'moment';
import {Cliente} from '../../models/cliente';
import { Observable, combineLatest } from 'rxjs';
import {ClientesService} from '../../services/clientes.service';
import {UsuariosService} from '../../services/usuarios.service';
import {Usuario} from '../../models/usuario';
import {ProductosService} from '../../services/productos.service';
import {Producto} from '../../models/producto';
import {AuthService} from '../../services/auth.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {MensajeService} from '../../services/mensaje.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {FiltroOrdenamientoComponent} from '../filtro-ordenamiento/filtro-ordenamiento.component';
import {ListadoDirective} from '../../directives/listado.directive';
import {BatchActionKey, BatchActionsService} from '../../services/batch-actions.service';
import {ActionConfiguration} from '../batch-actions-box/batch-actions-box.component';

@Component({
  selector: 'app-facturas-venta',
  templateUrl: './facturas-venta.component.html',
  styleUrls: ['./facturas-venta.component.scss']
})
export class FacturasVentaComponent extends ListadoDirective implements OnInit {
  rol = Rol;
  tiposDeComprobanteFV = [
    { val: TipoDeComprobante.FACTURA_A, text: 'Factura A' },
    { val: TipoDeComprobante.FACTURA_B, text: 'Factura B' },
    { val: TipoDeComprobante.FACTURA_X, text: 'Factura X' },
    { val: TipoDeComprobante.FACTURA_Y, text: 'Factura Y' },
    { val: TipoDeComprobante.PRESUPUESTO, text: 'Presupuesto' },
  ];

  ordenArray = [
    { val: 'fecha', text: 'Fecha' },
    { val: 'cliente.nombreFiscal', text: 'Cliente' },
    { val: 'total', text: 'Total' },
  ];

  sentidoArray = [
    { val: 'DESC', text: 'Descendente' },
    { val: 'ASC', text: 'Ascendente' },
  ];

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordernarPorFV') ordenarPorFVElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoFV') sentidoFVElement: FiltroOrdenamientoComponent;

  helper = HelperService;

  usuario: Usuario;

  allowedRolesToEnviarPorEmail: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRoleToEnviarPorEmail = false;

  allowedRolesToCrearNota: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToCrearNota = false;

  allowedRolesToSeeTotales: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToSeeTotales = false;

  baKey = BatchActionKey.FACTURAS_VENTA;
  baActions: ActionConfiguration[] = [
    {
      description: 'Nuevo Remito',
      icon: ['fas', 'file-export'],
      clickFn: () => this.router.navigate(['/remitos/nuevo']),
    }
  ];
  isBatchActionsBoxCollapsed = true;

  tiposDeComprobantesParaAutorizacion: TipoDeComprobante[] = [
    TipoDeComprobante.NOTA_CREDITO_A,
    TipoDeComprobante.NOTA_CREDITO_B,
    TipoDeComprobante.NOTA_CREDITO_C,
    TipoDeComprobante.NOTA_DEBITO_A,
    TipoDeComprobante.NOTA_DEBITO_B,
    TipoDeComprobante.NOTA_DEBITO_C,
  ];

  loadingTotalizadores = false;
  totalesData: TotalData[] = [
    { label: 'Ganancia Total', data: 0, hasRole: false },
    { label: 'Total IVA Venta', data: 0, hasRole: false },
    { label: 'Total Facturado', data: 0 },
  ]

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              private facturasVentaService: FacturasVentaService,
              private fb: UntypedFormBuilder,
              private clientesService: ClientesService,
              private usuariosService: UsuariosService,
              private productosService: ProductosService,
              private authService: AuthService,
              protected mensajeService: MensajeService,
              public loadingOverlayService: LoadingOverlayService,
              public batchActionsService: BatchActionsService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
    this.hasRoleToEnviarPorEmail = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToEnviarPorEmail);
    this.hasRoleToCrearNota = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCrearNota);
    this.hasRoleToSeeTotales = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToSeeTotales);

    this.totalesData[0].hasRole = this.hasRoleToSeeTotales;
    this.totalesData[1].hasRole = this.hasRoleToSeeTotales;
  }

  ngOnInit() {
    super.ngOnInit();
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
    const terminos: BusquedaFacturaVentaCriteria = {
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: this.page,
    };

    const { orden, sentido } = this.getDefaultOrdenYSentido();
    const config = {
      idCliente: { checkNaN: true },
      idUsuario: { checkNaN: true },
      idProducto: { checkNaN: true },
      idViajante: { checkNaN: true },
      fechaDesde: { checkNaN: true, callback: HelperService.timestampToDate },
      fechaHasta: { checkNaN: true, callback: HelperService.timestampToDate },
      ordenarPor: { defaultValue: orden },
      sentido: { defaultValue: sentido },
    };

    return HelperService.paramsToTerminos<BusquedaFacturaVentaCriteria>(ps, config , terminos);
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.facturasVentaService.buscar(terminos as BusquedaFacturaVentaCriteria);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      idCliente: '',
      idUsuario: '',
      idProducto: '',
      idViajante: '',
      rangoFecha: null,
      tipoComprobante: '',
      nroPedido: '',
      numSerie: '',
      numFactura: '',
      ordenarPor: '',
      sentido: '',
    });
  }

  resetFilterForm() {
    this.filterForm.reset({
      idCliente: '',
      idUsuario: '',
      idProducto: '',
      idViajante: '',
      rangoFecha: null,
      tipoComprobante: '',
      nroPedido: '',
      numSerie: '',
      numFactura: '',
      ordenarPor: '',
      sentido: '',
    });
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};

    if (values.rangoFecha && values.rangoFecha.desde) {
      ret.fechaDesde = this.helper.getUnixDateFromNgbDate(values.rangoFecha.desde); }
    if (values.rangoFecha && values.rangoFecha.hasta) {
      ret.fechaHasta = this.helper.getUnixDateFromNgbDate(values.rangoFecha.hasta); }
    if (values.idCliente) { ret.idCliente = values.idCliente; }
    if (values.idUsuario) { ret.idUsuario = values.idUsuario; }
    if (values.idProducto) { ret.idProducto = values.idProducto; }
    if (values.tipoComprobante) { ret.tipoComprobante = values.tipoComprobante; }
    if (values.idViajante) { ret.idViajante = values.idViajante; }
    if (values.numSerie) { ret.numSerie = values.numSerie; }
    if (values.numFactura) { ret.numFactura = values.numFactura; }
    if (values.nroPedido) { ret.nroPedido = values.nroPedido; }
    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (values.idCliente) {
      this.appliedFilters.push({ label: 'Cliente', value: values.idCliente, asyncFn: this.getClienteInfoAsync(values.idCliente) });
    }

    if (values.idUsuario) {
      this.appliedFilters.push({ label: 'Usuario', value: values.idUsuario, asyncFn: this.getUsuarioInfoAsync(values.idUsuario) });
    }

    if (values.idProducto) {
      this.appliedFilters.push({ label: 'Producto', value: values.idProducto, asyncFn: this.getProductoInfoAsync(values.idProducto) });
    }

    if (values.idViajante) {
      this.appliedFilters.push({ label: 'Viajante', value: values.idViajante, asyncFn: this.getUsuarioInfoAsync(values.idViajante) });
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

    if (values.tipoComprobante) {
      this.appliedFilters.push({ label: 'Tipo de Comprobante', value: values.tipoComprobante.replace('_',  ' ') });
    }

    if (values.nroPedido) {
      this.appliedFilters.push({ label: 'Nº Pedido', value: values.nroPedido });
    }

    if (values.numSerie || values.numFactura) {
      let ns = null;
      let nf = null;
      if (values.numSerie) {
        ns = Number(values.numSerie);
        ns = !isNaN(ns) ? ns : null;
      }
      if (values.numFactura) {
        nf = Number(values.numFactura);
        nf = !isNaN(nf) ? nf : null;
      }

      if (ns || nf) { this.appliedFilters.push({ label: 'Nº Factura', value: this.helper.formatNumFactura(ns, nf) }); }
    }

    setTimeout(() => {
      this.ordenarPorAplicado = this.ordenarPorFVElement ? this.ordenarPorFVElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoFVElement ? this.sentidoFVElement.getTexto() : '';
    }, 500);
  }

  getClienteInfoAsync(id: number): Observable<string> {
    return this.clientesService.getCliente(id).pipe(map((c: Cliente) => c.nombreFiscal));
  }

  getUsuarioInfoAsync(id: number): Observable<string> {
    return this.usuariosService.getUsuario(id).pipe(map((u: Usuario) => u.nombre + ' ' + u.apellido));
  }

  getProductoInfoAsync(id: number): Observable<string> {
    return this.productosService.getProducto(id).pipe(map((p: Producto) => p.descripcion));
  }

  getItems(terminos: BusquedaFacturaVentaCriteria) {
    super.getItems(terminos);

    const obvs = [this.facturasVentaService.totalFacturado(terminos)];
    if (this.hasRoleToSeeTotales) {
      obvs.push(this.facturasVentaService.gananciaTotal(terminos));
      obvs.push(this.facturasVentaService.totalIva(terminos));
   }
    obvs.push();
    this.loadingTotalizadores = true;
    combineLatest(obvs)
      .pipe(finalize(() => this.loadingTotalizadores = false))
      .subscribe({
        next: (data) => {
          this.totalesData[2].data = Number(data[0]);
          if (this.hasRoleToSeeTotales) {
            this.totalesData[0].data = Number(data[1]);
            this.totalesData[1].data = Number(data[2]);
          }
        },
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }
}
