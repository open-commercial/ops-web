import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../models/pedido';
import { Pagination } from '../../models/pagination';
import { EstadoPedido } from '../../models/estado-pedido';
import { finalize, map } from 'rxjs/operators';
import { UntypedFormBuilder } from '@angular/forms';
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
import { StorageKeys, StorageService } from '../../services/storage.service';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { ListadoDirective } from '../../directives/listado.directive';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export class PedidosComponent extends ListadoDirective implements OnInit {
  estado = EstadoPedido;
  rol = Rol;
  usuario: Usuario;

  estados = [
    { value: EstadoPedido.ABIERTO, text: EstadoPedido[EstadoPedido.ABIERTO] },
    { value: EstadoPedido.CANCELADO, text: EstadoPedido[EstadoPedido.CANCELADO] },
    { value: EstadoPedido.CERRADO, text: EstadoPedido[EstadoPedido.CERRADO] },
  ];

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRolToDelete = false;

  allowedRolesToEdit: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRolToEdit = false;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              private pedidosService: PedidosService,
              private fb: UntypedFormBuilder,
              private authService: AuthService,
              protected mensajeService: MensajeService,
              private clientesService: ClientesService,
              private usuariosService: UsuariosService,
              private productosService: ProductosService,
              private storageService: StorageService,
              public loadingOverlayService: LoadingOverlayService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  getEstadoValue(e: EstadoPedido): any {
    return EstadoPedido[e];
  }

  ngOnInit() {
    super.ngOnInit();
    this.hasRolToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    this.hasRolToEdit = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToEdit);
  }

  populateFilterForm(ps) {
    super.populateFilterForm(ps);

    const aux = { desde: null, hasta: null };
    if (ps.fechaDesde) {
      const d = moment.unix(ps.fechaDesde).local();
      aux.desde = { year: d.year(), month: d.month() + 1, day: d.date() };
    }

    if (ps.fechaHasta) {
      const h = moment.unix(ps.fechaHasta).local();
      aux.hasta = { year: h.year(), month: h.month() + 1, day: h.date() };
    }

    this.filterForm.get('rangoFecha').setValue(aux);
  }

  getTerminosFromQueryParams(ps) {
    const terminos: BusquedaPedidoCriteria = {
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: this.page,
    };

    const config = {
      idCliente: { checkNaN: true },
      idUsuario: { checkNaN: true },
      idProducto: { checkNaN: true },
      idViajante: { checkNaN: true },
      fechaDesde: { checkNaN: true, callback: HelperService.timestampToDate },
      fechaHasta: { checkNaN: true, callback: HelperService.timestampToDate },
    };

    return HelperService.paramsToTerminos<BusquedaPedidoCriteria>(ps, config , terminos);
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

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.pedidosService.buscar(terminos as BusquedaPedidoCriteria);
  }

  resetFilterForm() {
    this.filterForm.reset({
      idCliente: '',
      idUsuario: '',
      idProducto: '',
      idViajante: '',
      rangoFecha: null,
      estadoPedido: '',
      nroPedido: '',
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

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (values.idCliente) {
      this.appliedFilters.push({ label: 'Cliente', value: values.idCliente, asyncFn: this.getClienteInfoAsync(values.idCliente) });
    }

    if (values.idUsuario) {
      this.appliedFilters.push({ label: 'Usuario', value: values.idUsuario, asyncFn: this.getUsuarioInfoAsync(values.idUsuario) });
    }

    if (values.idProducto) {
      this.appliedFilters.push({ label: 'Producto', value: values.idProducto, asyncFn: this.getProductoInfoAsync(values.idProducto) });
    }

    if (values.idViajante) {
      this.appliedFilters.push({ label: 'Viajante', value: values.idViajante, asyncFn: this.getUsuarioInfoAsync(values.idViajante) });
    }

    if (values.rangoFecha && values.rangoFecha.desde) {
      this.appliedFilters.push({
        label: 'Fecha (desde)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFecha.desde)
      });
    }

    if (values.rangoFecha && values.rangoFecha.hasta) {
      this.appliedFilters.push({
        label: 'Fecha (hasta)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFecha.hasta)
      });
    }

    if (values.estadoPedido) {
      this.appliedFilters.push({ label: 'Estado', value: values.estadoPedido });
    }

    if (values.nroPedido) {
      this.appliedFilters.push({ label: 'Nº Pedido', value: values.nroPedido });
    }
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

  puedeFacturarPedido(p: Pedido) {
    return this.hasRolToEdit && (p.estado === EstadoPedido.ABIERTO);
  }

  puedeVerFacturas(p: Pedido) {
    return [EstadoPedido.CERRADO].indexOf(p.estado) >= 0;
  }

  crearPedido() {
    this.router.navigate(['/pedidos/nuevo']);
  }

  cancelarPedido(pedido: Pedido) {
    if (!this.puedeElimarPedido(pedido)) {
      this.mensajeService.msg('No posee permiso para cancelar un pedido.', MensajeModalType.ERROR);
      return;
    }

    const msg = `¿Está seguro que desea cancelar el pedido #${pedido.nroPedido}?`;

    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.pedidosService.cancelarPedido(pedido.idPedido)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe(
            () => {
              location.reload();
            },
            err => this.mensajeService.msg(`Error: ${err.error}`, MensajeModalType.ERROR),
          )
        ;
      }
    }, () => { return; });
  }

  editarPedido(pedido: Pedido) {
    if (!this.puedeEditarPedido(pedido)) {
      this.mensajeService.msg('No posee permiso para editar un pedido.', MensajeModalType.ERROR);
      return;
    }
    this.storageService.removeItem(StorageKeys.PEDIDO_EDITAR);
    this.router.navigate(['/pedidos/editar', pedido.idPedido]);
  }

  clonarPedido(pedido: Pedido) {
    this.storageService.removeItem(StorageKeys.PEDIDO_NUEVO);
    this.router.navigate(['/pedidos/nuevo'], { queryParams: { idToClone: pedido.idPedido }});
  }

  facturarPedido(pedido: Pedido) {
    if (!this.puedeFacturarPedido(pedido)) {
      this.mensajeService.msg('No posee permiso para facturar un pedido.', MensajeModalType.ERROR);
      return;
    }
    this.storageService.removeItem(StorageKeys.PEDIDO_FACTURAR);
    this.router.navigate(['/facturas-venta/de-pedido', pedido.idPedido]);
  }

  verFacturas(pedido: Pedido) {
    if (this.puedeVerFacturas(pedido)) {
      this.router.navigate(['/facturas-venta'], { queryParams: { nroPedido: pedido.nroPedido }});
    }
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
