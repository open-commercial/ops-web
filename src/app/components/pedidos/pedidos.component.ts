import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../models/pedido';
import { Pagination } from '../../models/pagination';
import { EstadoPedido } from '../../models/estado.pedido';
import { finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Rol } from '../../models/rol';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export class PedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading = false;
  estado = EstadoPedido;
  rol = Rol;

  estados = [
    { value: EstadoPedido.ABIERTO, text: EstadoPedido[EstadoPedido.ABIERTO] },
    { value: EstadoPedido.ACTIVO, text: EstadoPedido[EstadoPedido.ACTIVO] },
    { value: EstadoPedido.CERRADO, text: EstadoPedido[EstadoPedido.CERRADO] },
  ];

  isFiltersCollapsed = true;

  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  filterForm: FormGroup;
  applyFilters = [];

  constructor(private pedidosService: PedidosService,
              private fb: FormBuilder) { }

  getEstadoValue(e: EstadoPedido): any {
    return EstadoPedido[e];
  }

  ngOnInit() {
    this.createFilterForm();
    this.getPedidos(true);
  }

  getPedidos(clearResults: boolean = false) {
    const terminos = this.getFormValues();
    this.loading = true;
    this.page += 1;
    if (clearResults) {
      this.page = 0;
      this.pedidos = [];
    }
    this.getApplyFilters();
    this.pedidosService.buscar(terminos, this.page)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe((p: Pagination) => {
        p.content.forEach((e) => this.pedidos.push(e));
        this.totalElements = p.totalElements;
        this.totalPages = p.totalPages;
        this.size = p.size;
      });
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      cliente: '',
      usuario: '',
      producto: '',
      viajante: '',
      rangoFecha: null,
      estadoPedido: '',
      nroPedido: '',
    });
  }

  filter() {
      this.getPedidos(true);
      this.isFiltersCollapsed = true;
  }

  reset() {
    this.filterForm.reset({
      cliente: '',
      usuario: '',
      producto: '',
      viajante: '',
      rangoFecha: null,
      estadoPedido: '',
      nroPedido: '',
    });
    this.getPedidos(true);
  }

  getFormValues() {
    const values = this.filterForm.value;
    return {
      idCliente: values.cliente ? values.cliente.id_Cliente : '',
      idUsuario: values.usuario ? values.usuario.id_Usuario : '',
      idProducto: values.producto ? values.producto.idProducto : '',
      idViajante: values.viajante ? values.viajante.id_Usuario : '',
      desde: values.rangoFecha && values.rangoFecha.desde ? HelperService.getTimeStamp(values.rangoFecha.desde) : '',
      hasta: values.rangoFecha && values.rangoFecha.hasta ? HelperService.getTimeStamp(values.rangoFecha.hasta) : '',
      estadoPedido: values.estadoPedido,
      nroPedido: values.nroPedido,
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

    if (values.estadoPedido) {
      this.applyFilters.push({ label: 'Estado', value: values.estadoPedido });
    }

    if (values.nroPedido) {
      this.applyFilters.push({ label: 'Nº Pedido', value: values.nroPedido });
    }
  }

  loadMore() {
    this.getPedidos();
  }

  downloadPedidoPdf(pedido: Pedido) {
    this.pedidosService.getPedidoPdf(pedido).subscribe(
      (res) => {
        const file = new Blob([res], {type: 'application/pdf'});
        saveAs(file, `pedido-${pedido.nroPedido}.pdf`);
      }
    );
  }
}
