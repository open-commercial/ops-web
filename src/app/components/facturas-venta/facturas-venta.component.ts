import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FacturaVenta } from '../../models/factura-venta';
import { Rol } from '../../models/rol';
import { HelperService } from '../../services/helper.service';
import { Pagination } from '../../models/pagination';
import { finalize, map } from 'rxjs/operators';
import { saveAs } from 'file-saver';
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

@Component({
  selector: 'app-facturas-venta',
  templateUrl: './facturas-venta.component.html',
  styleUrls: ['./facturas-venta.component.scss']
})
export class FacturasVentaComponent implements OnInit {
  facturas = [];
  clearLoading = false;
  loading = false;
  rol = Rol;
  tiposFactura = [
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

  constructor(private facturasService: FacturasService,
              private facturasVentaService: FacturasVentaService,
              private fb: FormBuilder,
              private sucursalesService: SucursalesService,
              private router: Router,
              private route: ActivatedRoute,
              private clientesService: ClientesService,
              private usuariosService: UsuariosService,
              private productosService: ProductosService) { }

  ngOnInit() {
    this.createFilterForm();
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
    if (clearResults) {
      this.clearLoading = true;
      this.page = 0;
      this.facturas = [];
    } else {
      this.loading = true;
    }
    this.getApplyFilters();
    this.facturasVentaService.buscar(terminos, this.page)
      .pipe(
        finalize(() => { this.loading = false; this.clearLoading = false; })
      )
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

  downloadFacturaPdf(factura: FacturaVenta) {
    this.facturasVentaService.getFacturaPdf(factura).subscribe(
      (res) => {
        const file = new Blob([res], {type: 'application/pdf'});
        saveAs(file, `factura-venta.pdf`);
      }
    );
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
