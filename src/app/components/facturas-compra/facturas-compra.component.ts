import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { HelperService } from '../../services/helper.service';
import { map, finalize } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { FacturasCompraService } from '../../services/facturas-compra.service';
import { TipoDeComprobante } from '../../models/tipo-de-comprobante';
import { BusquedaFacturaCompraCriteria } from '../../models/criterias/busqueda-factura-compra-criteria';
import { SucursalesService } from '../../services/sucursales.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable, combineLatest } from 'rxjs';
import { Producto } from '../../models/producto';
import { ProveedoresService } from '../../services/proveedores.service';
import { ProductosService } from '../../services/productos.service';
import { Proveedor } from '../../models/proveedor';
import { FacturaCompra } from '../../models/factura-compra';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { FiltroOrdenamientoComponent } from '../filtro-ordenamiento/filtro-ordenamiento.component';
import { ListadoDirective } from '../../directives/listado.directive';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-facturas-compra',
  templateUrl: './facturas-compra.component.html',
  styleUrls: ['./facturas-compra.component.scss']
})
export class FacturasCompraComponent extends ListadoDirective implements OnInit {
  tiposDeComprobantesFC = [
    { val: TipoDeComprobante.FACTURA_A, text: 'Factura A' },
    { val: TipoDeComprobante.FACTURA_B, text: 'Factura B' },
    { val: TipoDeComprobante.FACTURA_X, text: 'Factura X' },
    { val: TipoDeComprobante.FACTURA_Y, text: 'Factura Y' },
    { val: TipoDeComprobante.PRESUPUESTO, text: 'Presupuesto' },
  ];

  ordenArray = [
    { val: 'fechaAlta', text: 'Fecha de Alta' },
    { val: 'fecha', text: 'Fecha Factura' },
    { val: 'proveedor.razonSocial', text: 'Proveedor' },
    { val: 'total', text: 'Total' },
  ];

  sentidoArray = [
    { val: 'DESC', text: 'Descendente' },
    { val: 'ASC', text: 'Ascendente' },
  ];

  helper = HelperService;

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordernarPorFC') ordenarPorFCElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoFC') sentidoFCElement: FiltroOrdenamientoComponent;

  loadigTotalizadores = false;
  totalFacturado = 0;
  totalIva = 0;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              private facturasCompraService: FacturasCompraService,
              private fb: UntypedFormBuilder,
              private proveedoresService: ProveedoresService,
              private productosService: ProductosService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  populateFilterForm(ps) {
    super.populateFilterForm(ps);

    let aux = { desde: null, hasta: null };
    if (ps.fechaFacturaDesde) {
      const d = moment.unix(ps.fechaFacturaDesde).local();
      aux.desde = { year: d.year(), month: d.month() + 1, day: d.date() };
    }

    if (ps.fechaFacturaHasta) {
      const h = moment.unix(ps.fechaFacturaHasta).local();
      aux.hasta = { year: h.year(), month: h.month() + 1, day: h.date() };
    }
    this.filterForm.get('rangoFechaFactura').setValue(aux);

    aux = { desde: null, hasta: null };
    if (ps.fechaAltaDesde) {
      const d = moment.unix(ps.fechaAltaDesde).local();
      aux.desde = { year: d.year(), month: d.month() + 1, day: d.date() };
    }

    if (ps.fechaAltaHasta) {
      const h = moment.unix(ps.fechaAltaHasta).local();
      aux.hasta = { year: h.year(), month: h.month() + 1, day: h.date() };
    }
    this.filterForm.get('rangoFechaAlta').setValue(aux);
  }

  getTerminosFromQueryParams(ps) {
    const terminos: BusquedaFacturaCompraCriteria = {
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: this.page,
    };

    const { orden, sentido } = this.getDefaultOrdenYSentido();
    const config = {
      idProveedor: { checkNaN: true },
      idProducto: { checkNaN: true },
      fechaFacturaDesde: { checkNaN: true, callback: HelperService.timestampToDate },
      fechaFacturaHasta: { checkNaN: true, callback: HelperService.timestampToDate },
      fechaAltaDesde: { checkNaN: true, callback: HelperService.timestampToDate },
      fechaAltaHasta: { checkNaN: true, callback: HelperService.timestampToDate },
      ordenarPor: { defaultValue: orden },
      sentido: { defaultValue: sentido },
    };

    return HelperService.paramsToTerminos<BusquedaFacturaCompraCriteria>(ps, config, terminos);
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

  getItems(terminos: BusquedaFacturaCompraCriteria) {
    super.getItems(terminos);
    const obvs = [
      this.facturasCompraService.totalFacturado(terminos),
      this.facturasCompraService.totalIva(terminos)
    ];
    this.loadigTotalizadores = true;
    combineLatest(obvs)
      .pipe(finalize(() => this.loadigTotalizadores = false))
      .subscribe({
        next: (valores: [number, number]) => {
          this.totalFacturado = valores[0];
          this.totalIva = valores[1];
        },
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }
}
