import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../models/pedido';
import { Pagination } from '../../models/pagination';
import { EstadoPedido } from '../../models/estado.pedido';
import { finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Rol } from '../../models/rol';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export class PedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidosLoading = false;
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

  static getTimeStamp(dateObj: any) {
    if (!dateObj) { return ''; }
    const dateStr = [dateObj.year, dateObj.month, dateObj.day].join('-');
    return Date.parse(dateStr);
  }

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
    this.pedidosLoading = true;
    this.page += 1;
    if (clearResults) {
      this.page = 0;
      this.pedidos = [];
    }
    this.pedidosService.buscar(terminos, this.page)
      .pipe(
        finalize(() => this.pedidosLoading = false)
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
      idCliente: '',
      idUsuario: '',
      idProducto: '',
      idViajante: '',
      rangoFecha: null,
      estadoPedido: '',
      nroPedido: '',
    });
  }

  filter() {
    // if (this.filterForm.valid) {
      this.getPedidos(true);
    // }
  }

  getFormValues() {
    const values = this.filterForm.value;
    return {
      idCliente: values.idCliente,
      idUsuario: values.idUsuario,
      idProducto: values.idProducto,
      idViajante: values.idViajante,
      desde: values.rangoFecha && values.rangoFecha.desde ? PedidosComponent.getTimeStamp(values.rangoFecha.desde) : '',
      hasta: values.rangoFecha && values.rangoFecha.hasta ? PedidosComponent.getTimeStamp(values.rangoFecha.hasta) : '',
      estadoPedido: values.estadoPedido,
      nroPedido: values.nroPedido,
    };
  }

  loadMore() {
    this.getPedidos();
  }
}
