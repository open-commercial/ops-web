import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FacturaVenta } from '../../models/factura';
import { HelperService } from '../../services/helper.service';
import { finalize } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { FacturasCompraService } from '../../services/facturas-compra.service';
import { TipoDeComprobante } from '../../models/tipo-de-comprobante';

@Component({
  selector: 'app-facturas-compra',
  templateUrl: './facturas-compra.component.html',
  styleUrls: ['./facturas-compra.component.scss']
})
export class FacturasCompraComponent implements OnInit {
  facturas = [];
  clearLoading = false;
  loading = false;

  tiposFactura = [
    { val: TipoDeComprobante[TipoDeComprobante.FACTURA_A], text: 'Factura A' },
    { val: TipoDeComprobante[TipoDeComprobante.FACTURA_B], text: 'Factura B' },
    { val: TipoDeComprobante[TipoDeComprobante.FACTURA_X], text: 'Factura X' },
    { val: TipoDeComprobante[TipoDeComprobante.FACTURA_Y], text: 'Factura Y' },
    { val: TipoDeComprobante[TipoDeComprobante.PRESUPUESTO], text: 'Presupuesto' },
  ];

  ordenarPorOptions = [
    { val: 'fecha', text: 'Fecha de factura' },
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

  constructor(private facturasCompraService: FacturasCompraService,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.createFilterForm();
    this.getFacturas(true);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      proveedor: '',
      producto: '',
      rangoFecha: null,
      tipoFactura: '',
      numSerie: '',
      numFactura: '',
      ordenarPor: this.ordenarPorOptions.length ? this.ordenarPorOptions[0].val : '',
      sentido: this.sentidoOptions.length ? this.sentidoOptions[0].val : '',
    });
  }

  getFacturas(clearResults: boolean = false) {
    const terminos = this.getFormValues();
    this.page += 1;
    if (clearResults) {
      this.clearLoading = true;
      this.page = 0;
      this.facturas = [];
    } else {
      this.loading = true;
    }
    this.getApplyFilters();
    this.facturasCompraService.buscar(terminos, this.page)
      .pipe(
        finalize(() => { this.loading = false; this.clearLoading = false; })
      )
      .subscribe((p: Pagination) => {
        p.content.forEach((e) => this.facturas.push(e));
        this.totalElements = p.totalElements;
        this.totalPages = p.totalPages;
        this.size = p.size;
      });
  }

  filter() {
    this.getFacturas(true);
    this.isFiltersCollapsed = true;
  }

  reset() {
    this.filterForm.reset({
      proveedor: '',
      producto: '',
      rangoFecha: null,
      tipoFactura: '',
      numSerie: '',
      numFactura: '',
      ordenarPor: this.ordenarPorOptions.length ? this.ordenarPorOptions[0].val : '',
      sentido: this.sentidoOptions.length ? this.sentidoOptions[0].val : '',
    });
    this.getFacturas(true);
  }

  getFormValues() {
    const values = this.filterForm.value;
    return {
      idProveedor: values.proveedor ? values.proveedor.id_Proveedor : '',
      idProducto: values.producto ? values.producto.idProducto : '',
      fechaDesde: values.rangoFecha && values.rangoFecha.desde ? this.helper.getTimeStamp(values.rangoFecha.desde) : '',
      fechaHasta: values.rangoFecha && values.rangoFecha.hasta ? this.helper.getTimeStamp(values.rangoFecha.hasta) : '',
      tipoComprobante: values.tipoFactura ? values.tipoFactura : '',
      numSerie: values.numSerie ? values.numSerie : '',
      numFactura: values.numFactura ? values.numFactura : '',
      ordenarPor: values.ordenarPor ? values.ordenarPor : null,
      sentido: values.sentido ? values.sentido : null,
    };
  }

  getApplyFilters() {
    const values = this.filterForm.value;
    this.applyFilters = [];

    // console.log(values); return;

    if (values.proveedor && values.proveedor.id_Proveedor) {
      const val = values.proveedor.nroProveedor + ' - ' + values.proveedor.razonSocial;
      this.applyFilters.push({ label: 'Cliente', value: val });
    }

    if (values.producto) {
      this.applyFilters.push({ label: 'Producto', value: `${values.producto.codigo} ${values.producto.descripcion}` });
    }

    if (values.rangoFecha && values.rangoFecha.desde) {
      this.applyFilters.push({
        label: 'Fecha (desde)', value: HelperService.getFormattedDate(values.rangoFecha.desde)
      });
    }

    if (values.rangoFecha && values.rangoFecha.hasta) {
      this.applyFilters.push({
        label: 'Fecha (hasta)', value: HelperService.getFormattedDate(values.rangoFecha.hasta)
      });
    }

    if (values.tipoFactura) {
      this.applyFilters.push({ label: 'Tipo de Factura', value: values.tipoFactura.replace('_',  ' ') });
    }

    if (values.numSerie) {
      this.applyFilters.push({ label: 'Nº Serie', value: values.numSerie });
    }

    if (values.numFactura) {
      this.applyFilters.push({ label: 'Nº Factura', value: values.numFactura });
    }
  }

  loadMore() {
    this.getFacturas();
  }
}
