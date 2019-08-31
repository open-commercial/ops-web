import { Component, OnInit } from '@angular/core';
import { FacturasVentaService } from '../../services/facturas-venta.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FacturaVenta, TipoDeComprobante } from '../../models/factura';
import { Rol } from '../../models/rol';
import { HelperService } from '../../services/helper.service';
import { Pagination } from '../../models/pagination';
import { finalize } from 'rxjs/operators';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-facturas-venta',
  templateUrl: './facturas-venta.component.html',
  styleUrls: ['./facturas-venta.component.scss']
})
export class FacturasVentaComponent implements OnInit {
  facturas = [];
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
              private fb: FormBuilder) { }

  ngOnInit() {
    this.createFilterForm();
    this.getFacturas(true);
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
    const terminos = this.getFormValues();
    this.loading = true;
    this.page += 1;
    if (clearResults) {
      this.page = 0;
      this.facturas = [];
    }
    this.getApplyFilters();
    this.facturasVentaService.buscar(terminos, this.page)
      .pipe(
        finalize(() => this.loading = false)
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

  getFormValues() {
    const values = this.filterForm.value;
    return {
      idCliente: values.cliente ? values.cliente.id_Cliente : '',
      idUsuario: values.usuario ? values.usuario.id_Usuario : '',
      idProducto: values.producto ? values.producto.idProducto : '',
      idViajante: values.viajante ? values.viajante.id_Usuario : '',
      desde: values.rangoFecha && values.rangoFecha.desde ? this.helper.getTimeStamp(values.rangoFecha.desde) : '',
      hasta: values.rangoFecha && values.rangoFecha.hasta ? this.helper.getTimeStamp(values.rangoFecha.hasta) : '',
      tipoComprobante: values.tipoFactura ? values.tipoFactura : '',
      nroPedido: values.nroPedido,
      numSerie: values.numSerie ? values.numSerie : '',
      numFactura: values.numFactura ? values.numFactura : '',
      ordenarPor: values.ordenarPor ? values.ordenarPor : null,
      sentido: values.sentido ? values.sentido : null,
    };
  }

  getApplyFilters() {
    const values = this.filterForm.value;
    this.applyFilters = [];

    if (values.cliente && values.cliente.id_Cliente) {
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
      const val = values.usuario.username + ' - ' + values.usuario.nombre + ' ' + values.usuario.apellido;
      this.applyFilters.push({ label: 'Viajante', value: val });
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
      this.applyFilters.push({ label: 'Tipo de Factura', value: values.tipoFactura });
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
