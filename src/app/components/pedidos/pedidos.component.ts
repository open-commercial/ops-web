import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../models/pedido';
import { Pagination } from '../../models/pagination';
import { EstadoPedido } from '../../models/estado.pedido';
import { finalize, map } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Rol } from '../../models/rol';
import { HelperService } from '../../services/helper.service';
import { BusquedaPedidoCriteria } from '../../models/criterias/busqueda-pedido-criteria';
import { SucursalesService } from '../../services/sucursales.service';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth.service';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { Cliente } from '../../models/cliente';
import { Producto } from '../../models/producto';
import { ClientesService } from '../../services/clientes.service';
import { UsuariosService } from '../../services/usuarios.service';
import { ProductosService } from '../../services/productos.service';

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
              private router: Router,
              private route: ActivatedRoute,
              private clientesService: ClientesService,
              private usuariosService: UsuariosService,
              private productosService: ProductosService) { }

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

    this.sucursalesService.sucursal$.subscribe(() => this.getPedidosFromQueryParams());
    this.route.queryParamMap.subscribe(params => this.getPedidosFromQueryParams(params));
  }

  getTerminosFromQueryParams(params = null) {
    const terminos: BusquedaPedidoCriteria = {
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: 0,
    };

    this.filterForm.reset({
      idCliente: '',
      idUsuario: '',
      idProducto: '',
      idViajante: '',
      rangoFecha: null,
      estadoPedido: '',
      nroPedido: '',
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

    if (ps.estadoPedido) {
      this.filterForm.get('estadoPedido').setValue(ps.estadoPedido);
      terminos.estadoPedido = ps.estadoPedido;
    }

    if (ps.nroPedido) {
      this.filterForm.get('nroPedido').setValue(ps.nroPedido);
      terminos.nroPedido = ps.nroPedido;
    }

    return terminos;
  }

  getPedidosFromQueryParams(params = null, clearResults = true) {
    const terminos = this.getTerminosFromQueryParams(params);
    this.getPedidos(clearResults, terminos);
  }

  getPedidos(clearResults: boolean = false, terminos = null) {
    terminos = terminos || this.getFormValues();
    terminos.idSucursal = Number(this.sucursalesService.getIdSucursal());
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
      })
    ;
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

    if (values.idCliente) { ret.idCliente = values.idCliente; }
    if (values.idUsuario) { ret.idUsuario = values.idUsuario; }
    if (values.idProducto) { ret.idProducto = values.idProducto; }
    if (values.idViajante) { ret.idViajante = values.idViajante; }
    if (values.rangoFecha && values.rangoFecha.desde) {
      ret.fechaDesde = HelperService.getUnixDateFromNgbDate(values.rangoFecha.desde);
    }
    if (values.rangoFecha && values.rangoFecha.hasta) {
      ret.fechaHasta = HelperService.getUnixDateFromNgbDate(values.rangoFecha.hasta);
    }
    if (values.estadoPedido) { ret.estadoPedido = values.estadoPedido; }
    if (values.nroPedido) { ret.nroPedido = values.nroPedido; }

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

    if (values.estadoPedido) {
      this.applyFilters.push({ label: 'Estado', value: values.estadoPedido });
    }

    if (values.nroPedido) {
      this.applyFilters.push({ label: 'Nº Pedido', value: values.nroPedido });
    }
  }

  loadMore() {
    this.getPedidosFromQueryParams(null, false);
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

    const msg = `Está seguro que desea eliminar el pedido # ${pedido.nroPedido}?`;

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
