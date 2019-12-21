import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../models/pedido';
import { Pagination } from '../../models/pagination';
import { EstadoPedido } from '../../models/estado.pedido';
import { finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Rol } from '../../models/rol';
import { saveAs } from 'file-saver';
import { HelperService } from '../../services/helper.service';
import { BusquedaPedidoCriteria } from '../../models/criterias/busqueda-pedido-criteria';
import { SucursalesService } from '../../services/sucursales.service';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth.service';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { Sucursal } from '../../models/sucursal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export class PedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  clearLoading = false;
  loading = false;
  estado = EstadoPedido;
  rol = Rol;
  usuario: Usuario;

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

  allowedRolesToDelete: Rol[] = [
    Rol.ADMINISTRADOR,
    Rol.ENCARGADO,
    Rol.VENDEDOR,
  ];
  hasRolToDelete = false;

  allowedRolesToEdit: Rol[] = [
    Rol.ADMINISTRADOR,
    Rol.ENCARGADO,
    Rol.VENDEDOR,
  ];
  hasRolToEdit = false;

  constructor(private pedidosService: PedidosService,
              private fb: FormBuilder,
              private sucursalesService: SucursalesService,
              private authService: AuthService,
              private mensajeService: MensajeService,
              private router: Router) { }

  getEstadoValue(e: EstadoPedido): any {
    return EstadoPedido[e];
  }

  ngOnInit() {
    this.createFilterForm();
    this.authService.getLoggedInUsuario().subscribe((u: Usuario) => {
      this.usuario = u;
      this.hasRolToDelete = this.usuario && this.usuario.roles.filter(x => this.allowedRolesToDelete.includes(x)).length > 0;
      this.hasRolToEdit = this.usuario && this.usuario.roles.filter(x => this.allowedRolesToEdit.includes(x)).length > 0;
    });
    this.getPedidos(true);

    this.sucursalesService.sucursal$.subscribe((s: Sucursal) => this.filter());
  }

  getPedidos(clearResults: boolean = false) {
    const terminos = this.getFormValues();
    this.page += 1;
    if (clearResults) {
      this.clearLoading = true;
      this.page = 0;
      this.pedidos = [];
    } else {
      this.loading = true;
    }
    this.getApplyFilters();
    this.pedidosService.buscar(terminos, this.page)
      .pipe(
        finalize(() => { this.loading = false; this.clearLoading = false; })
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
    const ret: BusquedaPedidoCriteria = {
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: 0
    };

    if (values.cliente) { ret.idCliente = values.cliente.idCliente; }
    if (values.usuario) { ret.idUsuario = values.usuario.idUsuario; }
    if (values.producto) { ret.idProducto = values.producto.idProducto; }
    if (values.viajante) { ret.idViajante = values.viajante.idUsuario; }
    if (values.rangoFecha && values.rangoFecha.desde) { ret.fechaDesde = HelperService.getDateFromNgbDate(values.rangoFecha.desde); }
    if (values.rangoFecha && values.rangoFecha.hasta) { ret.fechaHasta = HelperService.getDateFromNgbDate(values.rangoFecha.hasta); }
    if (values.estadoPedido) { ret.estadoPedido = values.estadoPedido; }
    if (values.nroPedido) { ret.nroPedido = values.nroPedido; }

    return ret;
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

  verPedido(pedido: Pedido) {
    this.router.navigate(['/pedidos/ver', pedido.idPedido]);
  }

  puedeElimarPedido(p: Pedido) {
    return this.hasRolToDelete && p.estado === EstadoPedido.ABIERTO;
  }

  puedeEditarPedido(p: Pedido) {
    return this.hasRolToEdit && p.estado === EstadoPedido.ABIERTO;
  }

  eliminarPedido(pedido: Pedido) {
    if (!this.puedeElimarPedido(pedido)) {
      this.mensajeService.msg('No posee permiso para eliminar un pedido.', MensajeModalType.ERROR);
      return;
    }

    const msg = `Èsta seguro que desea eliminar el pedido # ${pedido.nroPedido}?`;

    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.pedidosService.eliminarPedido(pedido.idPedido)
          .subscribe(
            () => {
              const idx: number = this.pedidos.findIndex((p: Pedido) => p.idPedido === pedido.idPedido);
              if (idx >= 0) { this.pedidos.splice(idx, 1); }
            },
            err => this.mensajeService.msg(`Error: ${err.error}`, MensajeModalType.ERROR),
          )
        ;
      }
    }, (reason) => {});
  }

  editarPedido(pedido: Pedido) {
    if (!this.puedeEditarPedido(pedido)) {
      this.mensajeService.msg('No posee permiso para editar un pedido.', MensajeModalType.ERROR);
      return;
    }

    this.router.navigate(['/pedidos/editar', pedido.idPedido]);
  }
}
