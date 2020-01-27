import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FacturaVenta } from '../../models/factura-venta';
import { Rol } from '../../models/rol';
import { HelperService } from '../../services/helper.service';
import { Pagination } from '../../models/pagination';
import { finalize } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { FacturasService } from '../../services/facturas.service';
import { FacturasVentaService } from '../../services/facturas-venta.service';
import { TipoDeComprobante } from '../../models/tipo-de-comprobante';
import { BusquedaFacturaVentaCriteria } from '../../models/criterias/busqueda-factura-venta-criteria';
import { SucursalesService } from '../../services/sucursales.service';
import { Sucursal } from '../../models/sucursal';

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

  constructor(private facturasVentaService: FacturasVentaService,
              private fb: FormBuilder,
              private sucursalesService: SucursalesService) { }

  ngOnInit() {
    this.createFilterForm();
    this.getFacturas(true);
    this.sucursalesService.sucursal$.subscribe((s: Sucursal) => this.filter());
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      cliente: '',
      usuario: '',
      producto: '',
      viajante: '',
      rangoFecha: null,
      tipoFactura: '',
      nroPedido: '',
      numSerie: '',
      numFactura: '',
      ordenarPor: this.ordenarPorOptions.length ? this.ordenarPorOptions[0].val : '',
      sentido: this.sentidoOptions.length ? this.sentidoOptions[0].val : '',
    });
  }

  getFacturas(clearResults: boolean = false) {
    const criteria = this.getFormValues();
    this.page += 1;
    if (clearResults) {
      this.clearLoading = true;
      this.page = 0;
      this.facturas = [];
    } else {
      this.loading = true;
    }
    this.getApplyFilters();
    this.facturasVentaService.buscar(criteria, this.page)
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
      cliente: '',
      usuario: '',
      producto: '',
      viajante: '',
      rangoFecha: null,
      tipoFactura: '',
      nroPedido: '',
      numSerie: '',
      numFactura: '',
      ordenarPor: this.ordenarPorOptions.length ? this.ordenarPorOptions[0].val : '',
      sentido: this.sentidoOptions.length ? this.sentidoOptions[0].val : '',
    });
    this.getFacturas(true);
  }

  getFormValues(): BusquedaFacturaVentaCriteria {
    const values = this.filterForm.value;
    const criteria: BusquedaFacturaVentaCriteria = {
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: 0,
    };

    if (values.rangoFecha && values.rangoFecha.desde) { criteria.fechaDesde = this.helper.getDateFromNgbDate(values.rangoFecha.desde); }
    if (values.rangoFecha && values.rangoFecha.hasta) { criteria.fechaHasta = this.helper.getDateFromNgbDate(values.rangoFecha.hasta); }
    if (values.cliente) { criteria.idCliente = values.cliente.idCliente; }
    if (values.tipoFactura) { criteria.tipoComprobante = values.tipoFactura; }
    if (values.usuario) { criteria.idUsuario = values.usuario.idUsuario; }
    if (values.viajante) { criteria.idViajante = values.viajante.idUsuario; }
    if (values.numSerie) { criteria.numSerie = values.numSerie; }
    if (values.numFactura) { criteria.numFactura = values.numFactura; }
    if (values.nroPedido) { criteria.nroPedido = values.nroPedido; }
    if (values.producto) { criteria.idProducto = values.producto.idProducto; }
    if (values.ordenarPor) { criteria.ordenarPor = values.ordenarPor; }
    if (values.sentido) { criteria.sentido = values.sentido; }

    return criteria;
  }

  getApplyFilters() {
    const values = this.filterForm.value;
    this.applyFilters = [];

    if (values.cliente && values.cliente.idCliente) {
      let val = values.cliente.nroCliente + ' - ' + values.cliente.nombreFiscal;
      if (values.cliente.nombreFantasia) { val += '"' + values.cliente.nombreFantasia + '"'; }
      this.applyFilters.push({ label: 'Cliente', value: val });
    }

    if (values.usuario) {
      const val = values.usuario.username + ' - ' + values.usuario.nombre + ' ' + values.usuario.apellido;
      this.applyFilters.push({ label: 'Usuario', value: val });
    }

    if (values.producto) {
      this.applyFilters.push({ label: 'Producto', value: `${values.producto.codigo} ${values.producto.descripcion}` });
    }

    if (values.viajante) {
      const val = values.viajante.username + ' - ' + values.viajante.nombre + ' ' + values.viajante.apellido;
      this.applyFilters.push({ label: 'Viajante', value: val });
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

  downloadFacturaPdf(factura: FacturaVenta) {
    this.facturasVentaService.getFacturaPdf(factura).subscribe(
      (res) => {
        const file = new Blob([res], {type: 'application/pdf'});
        saveAs(file, `factura-venta.pdf`);
      }
    );
  }
}
