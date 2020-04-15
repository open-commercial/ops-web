import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FacturaVenta } from '../../models/factura-venta';
import { Rol } from '../../models/rol';
import { HelperService } from '../../services/helper.service';
import { Pagination } from '../../models/pagination';
import { finalize, map } from 'rxjs/operators';
import { FacturasService } from '../../services/facturas.service';
import { FacturasVentaService } from '../../services/facturas-venta.service';
import { TipoDeComprobante } from '../../models/tipo-de-comprobante';
import { BusquedaFacturaVentaCriteria } from '../../models/criterias/busqueda-factura-venta-criteria';
import { SucursalesService } from '../../services/sucursales.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Cliente } from '../../models/cliente';
import { Observable } from 'rxjs';
import { ClientesService } from '../../services/clientes.service';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../models/usuario';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/producto';
import { AuthService } from '../../services/auth.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { MensajeService } from '../../services/mensaje.service';
import { LoadingOverlayService } from '../../services/loading-overlay.service';

@Component({
  selector: 'app-facturas-venta',
  templateUrl: './facturas-venta.component.html',
  styleUrls: ['./facturas-venta.component.scss']
})
export class FacturasVentaComponent implements OnInit {
  facturas = [];
  rol = Rol;
  tiposDeComprobante = [
    { val: TipoDeComprobante.FACTURA_A, text: 'Factura A' },
    { val: TipoDeComprobante.FACTURA_B, text: 'Factura B' },
    { val: TipoDeComprobante.FACTURA_X, text: 'Factura X' },
    { val: TipoDeComprobante.FACTURA_Y, text: 'Factura Y' },
    { val: TipoDeComprobante.PRESUPUESTO, text: 'Presupuesto' },
  ];

  ordenarPorOptions = [
    { val: 'fecha', text: 'Fecha' },
    { val: 'cliente.nombreFiscal', text: 'Cliente' },
    { val: 'total', text: 'Total' },
  ];

  sentidoOptions = [
    { val: 'DESC', text: 'Descendente' },
    { val: 'ASC',  text: 'Ascendente' },
  ];

  isFiltersCollapsed = true;

  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  filterForm: FormGroup;
  applyFilters = [];

  helper = HelperService;

  ordenarPorAplicado = '';
  sentidoAplicado = '';

  usuario: Usuario;

  allowedRolesToCrear: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRolToCrear = false;

  allowedRolesToAutorizar: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRolToAutorizar = false;

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR ];
  hasRolToDelete = false;

  allowedRolesToEnviarPorEmail: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRolToEnviarPorEmail = false;

  constructor(private facturasService: FacturasService,
              private facturasVentaService: FacturasVentaService,
              private fb: FormBuilder,
              private sucursalesService: SucursalesService,
              private router: Router,
              private route: ActivatedRoute,
              private clientesService: ClientesService,
              private usuariosService: UsuariosService,
              private productosService: ProductosService,
              private authService: AuthService,
              private mensajeService: MensajeService,
              public loadingOverlayService: LoadingOverlayService) { }

  ngOnInit() {
    this.createFilterForm();
    this.loadingOverlayService.activate();
    this.authService.getLoggedInUsuario()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe((u: Usuario) => {
        this.usuario = u;
        this.hasRolToCrear = this.usuario && this.usuario.roles.filter(x => this.allowedRolesToCrear.includes(x)).length > 0;
        this.hasRolToAutorizar = this.usuario && this.usuario.roles.filter(x => this.allowedRolesToAutorizar.includes(x)).length > 0;
        this.hasRolToDelete = this.usuario && this.usuario.roles.filter(x => this.allowedRolesToDelete.includes(x)).length > 0;
        this.hasRolToEnviarPorEmail = this.usuario &&
          this.usuario.roles.filter(x => this.allowedRolesToEnviarPorEmail.includes(x)).length > 0;
      });

    this.sucursalesService.sucursal$.subscribe(() => this.getFacturasFromQueryParams());
    this.route.queryParamMap.subscribe(params => this.getFacturasFromQueryParams(params));
  }

  getTerminosFromQueryParams(params = null) {
    const terminos: BusquedaFacturaVentaCriteria = {
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: 0,
    };

    this.filterForm.reset({
      idCliente: '',
      idUsuario: '',
      idProducto: '',
      idViajante: '',
      rangoFecha: null,
      tipoFactura: '',
      nroPedido: '',
      numSerie: '',
      numFactura: '',
      ordenarPor: this.ordenarPorOptions.length ? this.ordenarPorOptions[0].val : '',
      sentido: this.sentidoOptions.length ? this.sentidoOptions[0].val : '',
    });

    const ps = params ? params.params : this.route.snapshot.queryParams;

    if (ps.idCliente && !isNaN(ps.idCliente)) {
      this.filterForm.get('idCliente').setValue(Number(ps.idCliente));
      terminos.idCliente = Number(ps.idCliente);
    }

    if (ps.idUsuario && !isNaN(ps.idUsuario)) {
      this.filterForm.get('idUsuario').setValue(Number(ps.idUsuario));
      terminos.idUsuario = Number(ps.idUsuario);
    }

    if (ps.idProducto && !isNaN(ps.idProducto)) {
      this.filterForm.get('idProducto').setValue(Number(ps.idProducto));
      terminos.idProducto = Number(ps.idProducto);
    }

    if (ps.idViajante && !isNaN(ps.idViajante)) {
      this.filterForm.get('idViajante').setValue(Number(ps.idViajante));
      terminos.idViajante = Number(ps.idViajante);
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

    if (ps.tipoComprobante) {
      this.filterForm.get('tipoFactura').setValue(ps.tipoComprobante);
      terminos.tipoComprobante = ps.tipoComprobante;
    }

    if (ps.nroPedido) {
      this.filterForm.get('nroPedido').setValue(ps.nroPedido);
      terminos.nroPedido = ps.nroPedido;
    }

    if (ps.numSerie) {
      this.filterForm.get('numSerie').setValue(ps.numSerie);
      terminos.numSerie = Number(ps.numSerie);
    }

    if (ps.numFactura) {
      this.filterForm.get('numFactura').setValue(ps.numFactura);
      terminos.numFactura = Number(ps.numFactura);
    }

    if (ps.ordenarPor) {
      this.filterForm.get('ordenarPor').setValue(ps.ordenarPor);
      terminos.ordenarPor = ps.ordenarPor;
    }

    if (ps.sentido) {
      this.filterForm.get('sentido').setValue(ps.sentido);
      terminos.sentido = ps.sentido;
    }

    return terminos;
  }

  getFacturasFromQueryParams(params = null, clearResults = true) {
    const terminos = this.getTerminosFromQueryParams(params);
    this.getFacturas(clearResults, terminos);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      idCliente: '',
      idUsuario: '',
      idProducto: '',
      idViajante: '',
      rangoFecha: null,
      tipoFactura: '',
      nroPedido: '',
      numSerie: '',
      numFactura: '',
      ordenarPor: this.ordenarPorOptions.length ? this.ordenarPorOptions[0].val : '',
      sentido: this.sentidoOptions.length ? this.sentidoOptions[0].val : '',
    });
  }

  getFacturas(clearResults: boolean = false, terminos = null) {
    terminos = terminos || this.getFormValues();
    terminos.idSucursal = Number(this.sucursalesService.getIdSucursal());
    this.page += 1;
    this.loadingOverlayService.activate();
    if (clearResults) {
      this.page = 0;
      this.facturas = [];
    }
    this.getApplyFilters();

    terminos.pagina = this.page;
    this.facturasVentaService.buscar(terminos as BusquedaFacturaVentaCriteria)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe((p: Pagination) => {
        p.content.forEach((e) => this.facturas.push(e));
        this.totalElements = p.totalElements;
        this.totalPages = p.totalPages;
        this.size = p.size;
      })
    ;
  }

  filter() {
    const qParams = this.getFormValues();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: qParams,
    });
    this.isFiltersCollapsed = true;
  }

  reset() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: [],
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
    if (values.tipoFactura) { ret.tipoComprobante = values.tipoFactura; }
    if (values.idViajante) { ret.idViajante = values.idViajante; }
    if (values.numSerie) { ret.numSerie = values.numSerie; }
    if (values.numFactura) { ret.numFactura = values.numFactura; }
    if (values.nroPedido) { ret.nroPedido = values.nroPedido; }
    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
  }

  getApplyFilters() {
    const values = this.filterForm.value;
    this.applyFilters = [];

    if (values.idCliente) {
      this.applyFilters.push({ label: 'Cliente', value: values.idCliente, asyncFn: this.getClienteInfoAsync(values.idCliente) });
    }

    if (values.idUsuario) {
      this.applyFilters.push({ label: 'Usuario', value: values.idUsuario, asyncFn: this.getUsuarioInfoAsync(values.idUsuario) });
    }

    if (values.idProducto) {
      this.applyFilters.push({ label: 'Producto', value: values.idProducto, asyncFn: this.getProductoInfoAsync(values.idProducto) });
    }

    if (values.idViajante) {
      this.applyFilters.push({ label: 'Viajante', value: values.idViajante, asyncFn: this.getUsuarioInfoAsync(values.idViajante) });
    }

    if (values.rangoFecha && values.rangoFecha.desde) {
      this.applyFilters.push({
        label: 'Fecha (desde)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFecha.desde)
      });
    }

    if (values.rangoFecha && values.rangoFecha.hasta) {
      this.applyFilters.push({
        label: 'Fecha (hasta)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFecha.hasta)
      });
    }

    if (values.tipoFactura) {
      this.applyFilters.push({ label: 'Tipo de Factura', value: values.tipoFactura.replace('_',  ' ') });
    }

    if (values.nroPedido) {
      this.applyFilters.push({ label: 'Nº Pedido', value: values.nroPedido });
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

      if (ns || nf) { this.applyFilters.push({ label: 'Nº Factura', value: this.helper.formatNumFactura(ns, nf) }); }
    }

    this.ordenarPorAplicado = this.getTextoOrdenarPor();
    this.sentidoAplicado = this.getTextoSentido();
  }

  loadMore() {
    this.getFacturasFromQueryParams(null, false);
  }

  puedeCrearFactura() {
    return this.hasRolToCrear;
  }

  crearFactura() {
    if (!this.puedeCrearFactura()) {
      this.mensajeService.msg('No posee permiso para crear una factura.');
      return;
    }

    this.router.navigate(['/facturas-venta/nueva']);
  }

  verFactura(factura: FacturaVenta) {
    this.router.navigate(['/facturas-venta/ver', factura.idFactura]);
  }

  puedeAutorizarFactura(f: FacturaVenta) {
    return this.hasRolToAutorizar && !f.cae &&
      [TipoDeComprobante.FACTURA_A, TipoDeComprobante.FACTURA_B, TipoDeComprobante.FACTURA_C].indexOf(f.tipoComprobante) >= 0;
  }

  autorizarFactura(factura: FacturaVenta) {
    if (!this.puedeAutorizarFactura(factura)) {
      this.mensajeService.msg('No posee permiso para autorizar una factura o bien ya se encuentra autorizada.', MensajeModalType.ERROR);
      return;
    }

    this.loadingOverlayService.activate();
    this.facturasVentaService.autorizarFactura(factura.idFactura)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (f: FacturaVenta) => {
          if (f.cae) {
            const idx: number = this.facturas.findIndex((fv: FacturaVenta) => fv.idFactura === f.idFactura);
            if (idx >= 0) { this.facturas[idx] = f; }
            this.mensajeService.msg('La factura fué autorizada correctamente.', MensajeModalType.INFO);
          } else {
            this.mensajeService.msg('La factura NO fué autorizada por AFIP.', MensajeModalType.ERROR);
          }
        },
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      )
    ;
  }

  puedeEliminarFactura(f: FacturaVenta) {
    return this.hasRolToDelete && !f.cae;
  }

  eliminarFactura(factura: FacturaVenta) {
    if (!this.puedeEliminarFactura(factura)) {
      this.mensajeService.msg('No posee permiso para eliminar una factura.', MensajeModalType.ERROR);
      return;
    }

    const msg = `Está seguro que desea eliminar la factura #${this.helper.formatNumFactura(factura.numSerie, factura.numFactura)}?`;

    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.facturasService.eliminarFactura(factura.idFactura)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe(
            () => {
              const idx: number = this.facturas.findIndex((f: FacturaVenta) => f.idFactura === factura.idFactura);
              if (idx >= 0) { this.facturas.splice(idx, 1); }
            },
            err => this.mensajeService.msg(`Error: ${err.error}`, MensajeModalType.ERROR),
          )
        ;
      }
    }, () => {});
  }

  puedeEnviarPorEmail() {
    return this.hasRolToEnviarPorEmail;
  }

  enviarPorEmail(factura: FacturaVenta) {
    if (!this.puedeEnviarPorEmail()) {
      this.mensajeService.msg('No posee permiso para enviar la factura por email.', MensajeModalType.ERROR);
      return;
    }

    const msg = 'Está seguro que desea enviar un email con la factura al Cliente?';

    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.facturasVentaService.enviarPorEmail(factura.idFactura)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe(
            () => this.mensajeService.msg('La factura fue enviada por email.', MensajeModalType.INFO),
            err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
          )
        ;
      }
    });
  }

  getTextoOrdenarPor() {
    if (this.filterForm && this.filterForm.get('ordenarPor')) {
      const val = this.filterForm.get('ordenarPor').value;
      const aux = this.ordenarPorOptions.filter(e => e.val === val);
      return aux.length ? aux[0].text : '';
    }
    return '';
  }

  getTextoSentido() {
    if (this.filterForm && this.filterForm.get('sentido')) {
      const val = this.filterForm.get('sentido').value;
      const aux = this.sentidoOptions.filter(e => e.val === val);
      return aux.length ? aux[0].text : '';
    }
    return '';
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
}
