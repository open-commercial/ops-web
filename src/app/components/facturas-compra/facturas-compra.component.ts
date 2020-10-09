import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HelperService } from '../../services/helper.service';
import { map } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { FacturasCompraService } from '../../services/facturas-compra.service';
import { TipoDeComprobante } from '../../models/tipo-de-comprobante';
import { BusquedaFacturaCompraCriteria } from '../../models/criterias/busqueda-factura-compra-criteria';
import { SucursalesService } from '../../services/sucursales.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { Producto } from '../../models/producto';
import { ProveedoresService } from '../../services/proveedores.service';
import { ProductosService } from '../../services/productos.service';
import { Proveedor } from '../../models/proveedor';
import { FacturaCompra } from '../../models/factura-compra';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { FiltroOrdenamientoComponent } from '../filtro-ordenamiento/filtro-ordenamiento.component';
import { ListadoBaseComponent } from '../listado-base.component';
import { MensajeService } from '../../services/mensaje.service';

@Component({
  selector: 'app-facturas-compra',
  templateUrl: './facturas-compra.component.html',
  styleUrls: ['./facturas-compra.component.scss']
})
export class FacturasCompraComponent extends ListadoBaseComponent implements OnInit {
  tiposDeComprobantesFC = [
    { val: TipoDeComprobante.FACTURA_A, text: 'Factura A' },
    { val: TipoDeComprobante.FACTURA_B, text: 'Factura B' },
    { val: TipoDeComprobante.FACTURA_X, text: 'Factura X' },
    { val: TipoDeComprobante.FACTURA_Y, text: 'Factura Y' },
    { val: TipoDeComprobante.PRESUPUESTO, text: 'Presupuesto' },
  ];

  ordenarPorOptionsFC = [
    { val: 'fecha', text: 'Fecha Factura' },
    { val: 'fechaAlta', text: 'Fecha de Alta' },
    { val: 'proveedor.razonSocial', text: 'Proveedor' },
    { val: 'total', text: 'Total' },
  ];

  sentidoOptionsFC = [
    { val: 'ASC', text: 'Ascendente' },
    { val: 'DESC', text: 'Descendente' },
  ];

  helper = HelperService;

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordernarPorFC', { static: false }) ordenarPorFCElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoFC', { static: false }) sentidoFCElement: FiltroOrdenamientoComponent;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              private facturasCompraService: FacturasCompraService,
              private fb: FormBuilder,
              private proveedoresService: ProveedoresService,
              private productosService: ProductosService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getTerminosFromQueryParams(params = null) {
    const terminos: BusquedaFacturaCompraCriteria = {
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: 0,
    };

    this.resetFilterForm();

    const ps = params ? params.params : this.route.snapshot.queryParams;
    const p = Number(ps.p);

    this.page = isNaN(p) || p < 1 ? 0 : (p - 1);
    terminos.pagina = this.page;

    if (ps.idProveedor && !isNaN(ps.idProveedor)) {
      this.filterForm.get('idProveedor').setValue(Number(ps.idProveedor));
      terminos.idProveedor = Number(ps.idProveedor);
    }

    if (ps.idProducto && !isNaN(ps.idProducto)) {
      this.filterForm.get('idProducto').setValue(Number(ps.idProducto));
      terminos.idProducto = Number(ps.idProducto);
    }

    if (ps.fechaFacturaDesde || ps.fechaFacturaHasta) {
      const aux = { desde: null, hasta: null };

      if (ps.fechaFacturaDesde) {
        const d = moment.unix(ps.fechaFacturaDesde).local();
        aux.desde = { year: d.year(), month: d.month() + 1, day: d.date() };
        terminos.fechaFacturaDesde = d.toDate();
      }

      if (ps.fechaFacturaHasta) {
        const h = moment.unix(ps.fechaFacturaHasta).local();
        aux.hasta = { year: h.year(), month: h.month() + 1, day: h.date() };
        terminos.fechaFacturaHasta = h.toDate();
      }

      this.filterForm.get('rangoFechaFactura').setValue(aux);
    }

    if (ps.fechaAltaDesde || ps.fechaAltaHasta) {
      const aux = { desde: null, hasta: null };

      if (ps.fechaAltaDesde) {
        const d = moment.unix(ps.fechaAltaDesde).local();
        aux.desde = { year: d.year(), month: d.month() + 1, day: d.date() };
        terminos.fechaAltaDesde = d.toDate();
      }

      if (ps.fechaAltaHasta) {
        const h = moment.unix(ps.fechaAltaHasta).local();
        aux.hasta = { year: h.year(), month: h.month() + 1, day: h.date() };
        terminos.fechaAltaHasta = h.toDate();
      }

      this.filterForm.get('rangoFechaAlta').setValue(aux);
    }

    if (ps.tipoComprobante) {
      this.filterForm.get('tipoComprobante').setValue(ps.tipoComprobante);
      terminos.tipoComprobante = ps.tipoComprobante;
    }

    if (ps.numSerie) {
      this.filterForm.get('numSerie').setValue(ps.numSerie);
      terminos.numSerie = Number(ps.numSerie);
    }

    if (ps.numFactura) {
      this.filterForm.get('numFactura').setValue(ps.numFactura);
      terminos.numFactura = Number(ps.numFactura);
    }

    let ordenarPorVal = this.ordenarPorOptionsFC.length ? this.ordenarPorOptionsFC[0].val : '';
    if (ps.ordenarPor) { ordenarPorVal = ps.ordenarPor; }
    this.filterForm.get('ordenarPor').setValue(ordenarPorVal);
    terminos.ordenarPor = ordenarPorVal;

    const sentidoVal = ps.sentido ? ps.sentido : 'DESC';
    this.filterForm.get('sentido').setValue(sentidoVal);
    terminos.sentido = sentidoVal;

    return terminos;
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.facturasCompraService.buscar(terminos as BusquedaFacturaCompraCriteria);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      idProveedor: '',
      idProducto: '',
      rangoFechaFactura: null,
      rangoFechaAlta: null,
      tipoComprobante: '',
      numSerie: '',
      numFactura: '',
      ordenarPor: '',
      sentido: '',
    });
  }

  resetFilterForm() {
    this.filterForm.reset({
      idProveedor: '',
      idProducto: '',
      rangoFechaFactura: null,
      rangoFechaAlta: null,
      tipoComprobante: '',
      numSerie: '',
      numFactura: '',
      ordenarPor: '',
      sentido: '',
    });
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};

    if (values.rangoFechaFactura && values.rangoFechaFactura.desde) {
      ret.fechaFacturaDesde = this.helper.getUnixDateFromNgbDate(values.rangoFechaFactura.desde);
    }
    if (values.rangoFechaFactura && values.rangoFechaFactura.hasta) {
      ret.fechaFacturaHasta = this.helper.getUnixDateFromNgbDate(values.rangoFechaFactura.hasta);
    }

    if (values.rangoFechaAlta && values.rangoFechaAlta.desde) {
      ret.fechaAltaDesde = this.helper.getUnixDateFromNgbDate(values.rangoFechaAlta.desde);
    }
    if (values.rangoFechaAlta && values.rangoFechaAlta.hasta) {
      ret.fechaAltaHasta = this.helper.getUnixDateFromNgbDate(values.rangoFechaAlta.hasta);
    }

    if (values.idProveedor) { ret.idProveedor = values.idProveedor; }
    if (values.idProducto) { ret.idProducto = values.idProducto; }
    if (values.tipoComprobante) { ret.tipoComprobante = values.tipoComprobante; }
    if (values.numSerie) { ret.numSerie = values.numSerie; }
    if (values.numFactura) { ret.numFactura = values.numFactura; }
    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (values.idProveedor) {
      this.appliedFilters.push({ label: 'Proveedor', value: values.idProveedor, asyncFn: this.getProveedorInfoAsync(values.idProveedor) });
    }

    if (values.idProducto) {
      this.appliedFilters.push({ label: 'Producto', value: values.idProducto, asyncFn: this.getProductoInfoAsync(values.idProducto) });
    }

    if (values.rangoFechaFactura && values.rangoFechaFactura.desde) {
      this.appliedFilters.push({
        label: 'Fecha Factura (desde)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFechaFactura.desde)
      });
    }

    if (values.rangoFechaFactura && values.rangoFechaFactura.hasta) {
      this.appliedFilters.push({
        label: 'Fecha Factura (hasta)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFechaFactura.hasta)
      });
    }

    if (values.rangoFechaAlta && values.rangoFechaAlta.desde) {
      this.appliedFilters.push({
        label: 'Fecha Alta (desde)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFechaAlta.desde)
      });
    }

    if (values.rangoFechaAlta && values.rangoFechaAlta.hasta) {
      this.appliedFilters.push({
        label: 'Fecha Alta (hasta)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFechaAlta.hasta)
      });
    }

    if (values.tipoComprobante) {
      this.appliedFilters.push({ label: 'Tipo de Comprobante', value: values.tipoComprobante.replace('_',  ' ') });
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
      this.ordenarPorAplicado = this.ordenarPorFCElement ? this.ordenarPorFCElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoFCElement ? this.sentidoFCElement.getTexto() : '';
    }, 500);
  }

  getProveedorInfoAsync(id: number): Observable<string> {
    return this.proveedoresService.getProveedor(id).pipe(map((p: Proveedor) => p.razonSocial));
  }

  getProductoInfoAsync(id: number): Observable<string> {
    return this.productosService.getProducto(id).pipe(map((p: Producto) => p.descripcion));
  }

  verFactura(factura: FacturaCompra) {
    this.router.navigate(['/facturas-compra/ver', factura.idFactura]);
  }
}
