import { TableFieldConfig, ListaTableKey } from './../lista-table/lista-table.component';
import { TotalData } from './../totales/totales.component';
import {Component, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder} from '@angular/forms';
import {SucursalesService} from '../../services/sucursales.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BusquedaProductoCriteria} from '../../models/criterias/busqueda-producto-criteria';
import {Rubro} from '../../models/rubro';
import {RubrosService} from '../../services/rubros.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {finalize, map} from 'rxjs/operators';
import {MensajeService} from '../../services/mensaje.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {Producto} from '../../models/producto';
import {Pagination} from '../../models/pagination';
import {ProductosService} from '../../services/productos.service';
import {combineLatest, Observable} from 'rxjs';
import {Proveedor} from '../../models/proveedor';
import {ProveedoresService} from '../../services/proveedores.service';
import {ListadoDirective} from '../../directives/listado.directive';
import {FiltroOrdenamientoComponent} from '../filtro-ordenamiento/filtro-ordenamiento.component';
import {Rol} from '../../models/rol';
import {AuthService} from '../../services/auth.service';
import {BatchActionKey, BatchActionsService} from '../../services/batch-actions.service';
import {ActionConfiguration} from '../batch-actions-box/batch-actions-box.component';
import {Sucursal} from '../../models/sucursal';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent extends ListadoDirective implements OnInit {
  isBatchActionsBoxCollapsed = true;
  ordenArray = [
    { val: 'fechaUltimaModificacion', text: 'Fecha Últ. Modificación' },
    { val: 'descripcion', text: 'Descripción' },
    { val: 'codigo', text: 'Código' },
    { val: 'cantidadProducto.cantidadTotalEnSucursales', text: 'Total Sucursales' },
    { val: 'cantidadProducto.cantMinima', text: 'Venta x Cantidad' },
    { val: 'precioProducto.precioCosto', text: 'Precio Costo' },
    { val: 'precioProducto.gananciaPorcentaje', text: '% Ganancia' },
    { val: 'precioProducto.precioLista', text: 'Precio Lista' },
    { val: 'fechaAlta', text: 'Fecha Alta' },
    { val: 'proveedor.razonSocial', text: 'Proveedor' },
    { val: 'rubro.nombre', text: 'Rubro' },
  ];

  sentidoArray = [
    { val: 'DESC', text: 'Descendente' },
    { val: 'ASC', text: 'Ascendente' },
  ];

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordernarPorP') ordenarPorPElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoP') sentidoPElement: FiltroOrdenamientoComponent;

  rubros: Rubro[] = [];
  visibilidades = ['Públicos', 'Privados'];

  allowedRolesToCreate: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToCreate = false;

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR ];
  hasRoleToDelete = false;

  allowedRolesToEdit: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToEdit = false;

  allowedRolesToSeeValorStock: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRolToSeeValorStock = false;

  baKey = BatchActionKey.PRODUCTOS;
  baActions: ActionConfiguration[] = [
    {
      description: 'Editar seleccionados',
      icon: ['fas', 'pen'],
      clickFn: () => this.router.navigate(['/productos/editar-multiple']),
    },
    {
      description: 'Eliminar seleccionados',
      icon: ['fas', 'trash'],
      clickFn: ids => this.eliminarSeleccionados(ids),
      isVisible: () => this.hasRoleToDelete,
    }
  ];

  tableConfig: TableFieldConfig[] = [
    { field: 'publico', name: 'Público', canBeHidden: true, hidden: false },
    { field: 'oferta', name: 'Oferta', canBeHidden: true, hidden: false },
    { field: 'codigo', name: 'Código', canBeHidden: false,	hidden: false },
    { field: 'descripcion', name: 'Descripción', canBeHidden: false, hidden: false },
    { field: 'cantidadTotalEnSucursales', name: 'Stock', canBeHidden: true, hidden: false },
    { field: 'cantidadTotalEnSucursalesDisponible', name: 'Otras Sucursales', canBeHidden: true, hidden: false },
    { field: 'cantidadReservada', name: 'Reservada', canBeHidden: true, hidden: false },
    { field: 'cantMinima', name: 'Cant. Mínima', canBeHidden: true, hidden: false },
    { field: 'precioCosto', name: 'Precio Costo', canBeHidden: true, hidden: false },
    { field: 'gananciaPorcentaje', name: '% Ganancia', canBeHidden: true, hidden: true },
    { field: 'gananciaNeto', name: 'Ganancia', canBeHidden: true, hidden: true },
    { field: 'precioVentaPublico', name: 'PVP', canBeHidden: true, hidden: false },
    { field: 'ivaPorcentaje', name: '% IVA',canBeHidden: true, hidden: true },
    { field: 'ivaNeto', name: 'IVA', canBeHidden: true, hidden: true },
    { field: 'precioLista', name: 'Precio Lista', canBeHidden: true, hidden: false },
    { field: 'porcentajeBonificacionOferta', name: '% Oferta', canBeHidden: true, hidden: false },
    { field: 'porcentajeBonificacionPrecio', name: '% Bonif.', canBeHidden: true, hidden: false },
    { field: 'precioBonificado', name: 'Precio Bonif.', canBeHidden: true, hidden: false },
    { field: 'nombreRubro', name: 'Rubro', canBeHidden: true, hidden: true },
    { field: 'fechaUltimaModificacion', name: 'Fecha U. Modif.', canBeHidden: true, hidden: false },
    { field: 'razonSocialProveedor', name: 'Proveedor', canBeHidden: true, hidden: true },
    { field: 'fechaAlta', name: 'Fecha Alta', canBeHidden: true, hidden: false },
    { field: 'fechaVencimiento', name: 'Fecha Vencimiento', canBeHidden: true, hidden: true },
    { field: 'nota', name: 'Nota', canBeHidden: true, hidden: true },
  ];

  ltKey = ListaTableKey.PRODUCTOS;

  valorStockLoading = false;
  totalesData: TotalData[] = [
    { label: 'Valor del Stock', data: 0, hasRole: false },
  ];

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              private fb: UntypedFormBuilder,
              private rubrosService: RubrosService,
              private authService: AuthService,
              public loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              public productosService: ProductosService,
              private proveedoresService: ProveedoresService,
              public batchActionsService: BatchActionsService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    this.hasRoleToEdit = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToEdit);
    this.hasRoleToCreate = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCreate);
    this.hasRolToSeeValorStock = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToSeeValorStock);

    this.totalesData[0].hasRole = this.hasRolToSeeValorStock;
  }

  ngOnInit() {
    super.ngOnInit();

    this.loadingOverlayService.activate();
    this.rubrosService.getRubros()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: rubros => this.rubros = rubros,
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      })
    ;
  }

  getTerminosFromQueryParams(ps) {
    const terminos: BusquedaProductoCriteria = {
      pagina: this.page,
    };

    if (ps.codODes) {
      terminos.codigo = ps.codODes;
      terminos.descripcion = ps.codODes;
    }

    if (ps.idRubro && !isNaN(ps.idRubro)) {
      terminos.idRubro = Number(ps.idRubro);
    }

    if (ps.idProveedor && !isNaN(ps.idProveedor)) {
      terminos.idProveedor = Number(ps.idProveedor);
    }

    if (this.visibilidades.indexOf(ps.visibilidad) >= 0) {
      if (ps.visibilidad === 'Públicos') { terminos.publico = true; }
      if (ps.visibilidad === 'Privados') { terminos.publico = false; }
    }

    if (['true', true].indexOf(ps.oferta) >= 0) {
      this.filterForm.get('oferta').setValue(true);
      terminos.oferta = true;
    }

    if (['true', true].indexOf(ps.listarSoloParaCatalogo) >= 0) {
      this.filterForm.get('listarSoloParaCatalogo').setValue(true);
      terminos.listarSoloParaCatalogo = true;
    }

    const { orden, sentido } = this.getDefaultOrdenYSentido();
    const ordenarPorVal = ps.ordenarPor ? ps.ordenarPor : orden;
    terminos.ordenarPor = [];
    terminos.ordenarPor.push(ordenarPorVal);
    if (['proveedor.razonSocial', 'rubro.nombre'].indexOf(ordenarPorVal) >= 0) {
      terminos.ordenarPor.push('descripcion');
    }
    terminos.sentido = ps.sentido ? ps.sentido : sentido;
    return terminos;
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.productosService.buscar(terminos as BusquedaProductoCriteria);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      codODes: '',
      idRubro: null,
      idProveedor: null,
      visibilidad: null,
      oferta: false,
      listarSoloParaCatalogo: false,
      ordenarPor: '',
      sentido: '',
    });
  }

  resetFilterForm() {
    this.filterForm.reset({
      codODes: '',
      idRubro: null,
      idProveedor: null,
      visibilidad: null,
      oferta: false,
      listarSoloParaCatalogo: false,
      ordenarPor: '',
      sentido: '',
    });
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};

    if (values.codODes) { ret.codODes = values.codODes; }
    if (values.idRubro) { ret.idRubro = values.idRubro; }
    if (values.idProveedor) { ret.idProveedor = values.idProveedor; }
    if (values.visibilidad) { ret.visibilidad = values.visibilidad; }
    if (values.oferta) { ret.oferta = values.oferta; }
    if (values.listarSoloParaCatalogo) { ret.listarSoloParaCatalogo = values.listarSoloParaCatalogo; }
    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (values.codODes) {
      this.appliedFilters.push({ label: 'Código/Descripción', value: values.codODes });
    }

    if (values.idRubro) {
      this.appliedFilters.push({ label: 'Rubro', value: values.idRubro, asyncFn: this.getRubroInfoAsync(values.idRubro) });
    }

    if (values.idProveedor) {
      this.appliedFilters.push({ label: 'Proveedor', value: values.idProveedor, asyncFn: this.getProveedorInfoAsync(values.idProveedor) });
    }

    if (values.visibilidad) {
      this.appliedFilters.push({
        label: 'Visibilidad',
        value: values.visibilidad.length ? (values.visibilidad.charAt(0).toUpperCase() + values.visibilidad.slice(1)) : '',
      });
    }

    if (values.oferta) {
      this.appliedFilters.push({ label: '', value: 'Solo Ofertas' });
    }

    if (values.listarSoloParaCatalogo) {
      this.appliedFilters.push({ label: '', value: 'Solo Catálogo' });
    }

    setTimeout(() => {
      this.ordenarPorAplicado = this.ordenarPorPElement ? this.ordenarPorPElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoPElement ? this.sentidoPElement.getTexto() : '';
    }, 500);
  }

  getRubroInfoAsync(id: number): Observable<string> {
    return this.rubrosService.getRubro(id).pipe(map((r: Rubro) => r.nombre));
  }

  getProveedorInfoAsync(id: number): Observable<string> {
    return this.proveedoresService.getProveedor(id).pipe(map((p: Proveedor) => p.razonSocial));
  }

  verProducto(producto: Producto) {
    this.router.navigate(['/productos/ver', producto.idProducto]);
  }

  editarProducto(producto: Producto) {
    if (!this.hasRoleToEdit) {
      this.mensajeService.msg('No posee permiso para editar productos.', MensajeModalType.ERROR);
      return;
    }

    this.router.navigate(['/productos/editar', producto.idProducto]);
  }

  eliminarProducto(producto: Producto) {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('No posee permiso para eliminar productos.', MensajeModalType.ERROR);
      return;
    }

    const msg = `¿Está seguro que desea eliminar el producto "${producto.descripcion}"?`;

    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.productosService.eliminarProductos([producto.idProducto])
          .subscribe({
            next: () => {
              this.batchActionsService.removeElememt(this.baKey, producto.idProducto);
              // no se hace this.loadingOverlayService.deactivate() porque necesita que se recargue el reload
              location.reload();
            },
            error: err => {
              this.loadingOverlayService.deactivate();
              this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            }
          })
        ;
      }
    }, () => { return; });
  }

  eliminarSeleccionados(ids: number[]) {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('No posee permiso para eliminar productos.', MensajeModalType.ERROR);
      return;
    }

    const msg = '¿Desea eliminar los productos seleccionandos?';
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.productosService.eliminarProductos(ids)
          .subscribe({
            next: () => {
              this.batchActionsService.clear(this.baKey);
              location.reload();
              // no se hace this.loadingOverlayService.deactivate() porque necesita que se recargue el reload
            },
            error: err => {
              this.loadingOverlayService.deactivate();
              this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            }
          })
        ;
      }
    });
  }

  descargarReporteAlEmail() {
    const qParams = this.getFormValues();
    const terminos = this.getTerminosFromQueryParams(qParams);

    const obs: Observable<any>[] = [
      this.sucursalesService.getSucursal(this.sucursalesService.getIdSucursal()),
      this.productosService.getReporte(terminos)
    ];

    this.loadingOverlayService.activate();
    combineLatest(obs)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (data: [Sucursal]) => {
          const email = data[0].email;
          this.mensajeService.msg(
            `En breve recibirá un email con la información solicitada a la dirección ${email}`, MensajeModalType.INFO
          );
        },
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

  getItems(terminos: BusquedaProductoCriteria) {
    super.getItems(terminos);
    if (this.hasRolToSeeValorStock) {
      this.valorStockLoading = true;
      this.productosService.valorStock(terminos)
        .pipe(finalize(() => this.valorStockLoading = false))
        .subscribe({
          // next: (valorStock: number) => this.valorStock = Number(valorStock),
          next: (valorStock: number) => this.totalesData[0].data = Number(valorStock),
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }
}
