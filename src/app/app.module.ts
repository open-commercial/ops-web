import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBoostrapModule } from './modules/ng-boostrap.module';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faPortrait } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { faCashRegister } from '@fortawesome/free-solid-svg-icons';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faBarcode } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { faFileSignature  } from '@fortawesome/free-solid-svg-icons';
import { faFileDownload  } from '@fortawesome/free-solid-svg-icons';
import { faChevronLeft  } from '@fortawesome/free-solid-svg-icons';
import { faIndustry  } from '@fortawesome/free-solid-svg-icons';
import { faSuitcase  } from '@fortawesome/free-solid-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { faArrowAltCircleDown } from '@fortawesome/free-solid-svg-icons';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';

import { HomeComponent } from './components/home/home.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { registerLocaleData } from '@angular/common';
import localeEsAR from '@angular/common/locales/es-AR';
import localeEsARExtra from '@angular/common/locales/extra/es-AR';
import { ClienteFiltroComponent } from './components/cliente-filtro/cliente-filtro.component';
import { UsuarioFiltroComponent } from './components/usuario-filtro/usuario-filtro.component';
import { ProductoFiltroComponent } from './components/producto-filtro/producto-filtro.component';
import { RangoFechaFiltroComponent } from './components/rango-fecha-filtro/rango-fecha-filtro.component';
import { FacturasVentaComponent } from './components/facturas-venta/facturas-venta.component';
import { FacturasCompraComponent } from './components/facturas-compra/facturas-compra.component';
import { ProveedorFiltroComponent } from './components/proveedor-filtro/proveedor-filtro.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { PedidoComponent } from './components/pedido/pedido.component';
import { ProductoModalComponent } from './components/producto-modal/producto-modal.component';
import { BusquedaCuentaCorrienteClienteComponent } from './components/busqueda-cuenta-corriente-cliente/busqueda-cuenta-corriente-cliente.component';
import { CantidadProductoModalComponent } from './components/cantidad-producto-modal/cantidad-producto-modal.component';
import { CuentaCorrienteClienteModalComponent } from './components/cuenta-corriente-cliente-modal/cuenta-corriente-cliente-modal.component';
import { UbicacionFacturacionComponent } from './components/ubicacion-facturacion-component/ubicacion-facturacion.component';
import { UbicacionModalComponent } from './components/ubicacion-modal-component/ubicacion-modal.component';
import { EliminarRenglonPedidoModalComponent } from './components/eliminar-renglon-pedido-modal/eliminar-renglon-pedido-modal.component';
import { UbicacionEnvioComponent } from './components/ubicacion-envio-component/ubicacion-envio.component';
import { MensajeModalComponent } from './components/mensaje-modal/mensaje-modal.component';
import { PedidosHomeComponent } from './components/pedidos-home/pedidos-home.component';
import { VerPedidoComponent } from './components/ver-pedido/ver-pedido.component';
import { FacturaVentaComponent } from './components/factura-venta/factura-venta.component';
import { FacturasVentaHomeComponent } from './components/facturas-venta-home/facturas-venta-home.component';
import { ClienteModalComponent } from './components/cliente-modal/cliente-modal.component';
import { UsuarioModalComponent } from './components/usuario-modal/usuario-modal.component';
import { ProveedorModalComponent } from './components/proveedor-modal/proveedor-modal.component';
import { MensajeAsicronicoComponent } from './components/mensaje-asicronico/mensaje-asicronico.component';
import { BusquedaProductoComponent } from './components/busqueda-producto/busqueda-producto.component';
import { DisponibilidadStockModalComponent } from './components/disponibilidad-stock-modal/disponibilidad-stock-modal.component';
import { VerFacturaComponent } from './components/ver-factura/ver-factura.component';
import { FacturasCompraHomeComponent } from './components/facturas-compra-home/facturas-compra-home.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { ProductosHomeComponent } from './components/productos-home/productos-home.component';
import { ProductosComponent } from './components/productos/productos.component';
import { VerProductoComponent } from './components/ver-producto/ver-producto.component';
import { ProductoComponent } from './components/producto/producto.component';
import { FiltroOrdenamientoComponent } from './components/filtro-ordenamiento/filtro-ordenamiento.component';
import { FiltrosFormComponent } from './components/filtros-form/filtros-form.component';
import { FiltrosAplicadosComponent } from './components/filtros-aplicados/filtros-aplicados.component';
import { ListaComponent } from './components/lista/lista.component';
import { TransportistaComponent } from './components/transportista/transportista.component';
import { PagosComponent } from './components/pagos/pagos.component';
import { TraspasosComponent } from './components/traspasos/traspasos.component';
import { TraspasosHomeComponent } from './components/traspasos-home/traspasos-home.component';
import { VerTraspasoComponent } from './components/ver-traspaso/ver-traspaso.component';
import { TraspasoComponent } from './components/traspaso/traspaso.component';
import { ClienteInfoComponent } from './components/cliente-info/cliente-info.component';
import { BatchActionsBoxComponent } from './components/batch-actions-box/batch-actions-box.component';
import { ProductoMultiEditorComponent } from './components/producto-multi-editor/producto-multi-editor.component';
import { CalculosPrecioFormComponent } from './components/calculos-precio-form/calculos-precio-form.component';
import { RemitosComponent } from './components/remitos/remitos.component';
import { RemitosHomeComponent } from './components/remitos-home/remitos-home.component';
import { VerRemitoComponent } from './components/ver-remito/ver-remito.component';
import { RemitoComponent } from './components/remito/remito.component';

registerLocaleData(localeEsAR, 'es-AR', localeEsARExtra);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SideNavComponent,
    HomeComponent,
    PedidosComponent,
    ClienteFiltroComponent,
    UsuarioFiltroComponent,
    ProductoFiltroComponent,
    RangoFechaFiltroComponent,
    FacturasVentaComponent,
    FacturasCompraComponent,
    ProveedorFiltroComponent,
    NavBarComponent,
    PedidoComponent,
    ProductoModalComponent,
    BusquedaCuentaCorrienteClienteComponent,
    CantidadProductoModalComponent,
    CuentaCorrienteClienteModalComponent,
    UbicacionFacturacionComponent,
    UbicacionEnvioComponent,
    UbicacionModalComponent,
    EliminarRenglonPedidoModalComponent,
    MensajeModalComponent,
    PedidosHomeComponent,
    VerPedidoComponent,
    FacturaVentaComponent,
    FacturasVentaHomeComponent,
    ClienteModalComponent,
    UsuarioModalComponent,
    ProveedorModalComponent,
    MensajeAsicronicoComponent,
    ProductosHomeComponent,
    ProductosComponent,
    BusquedaProductoComponent,
    DisponibilidadStockModalComponent,
    VerFacturaComponent,
    FacturasCompraHomeComponent,
    LoadingOverlayComponent,
    ProductosHomeComponent,
    ProductosComponent,
    VerProductoComponent,
    ProductoComponent,
    FiltroOrdenamientoComponent,
    FiltrosFormComponent,
    FiltrosAplicadosComponent,
    ListaComponent,
    TransportistaComponent,
    PagosComponent,
    TraspasosComponent,
    TraspasosHomeComponent,
    VerTraspasoComponent,
    TraspasoComponent,
    ClienteInfoComponent,
    BatchActionsBoxComponent,
    ProductoMultiEditorComponent,
    CalculosPrecioFormComponent,
    RemitosComponent,
    RemitosHomeComponent,
    VerRemitoComponent,
    RemitoComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgBoostrapModule,
    FontAwesomeModule,
    AppRoutingModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-AR' },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  entryComponents: [
    ProductoModalComponent,
    CantidadProductoModalComponent,
    CuentaCorrienteClienteModalComponent,
    UbicacionModalComponent,
    EliminarRenglonPedidoModalComponent,
    MensajeModalComponent,
    ClienteModalComponent,
    UsuarioModalComponent,
    ProveedorModalComponent,
    DisponibilidadStockModalComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      faBars,
      faCircleNotch,
      faFileInvoice,
      faFilter,
      faSearch,
      faTrash,
      faCalendar,
      faEye,
      faEyeSlash,
      faPortrait,
      faTimes,
      faCheck,
      faExclamationTriangle,
      faCashRegister,
      faClipboardList,
      faPlus,
      faBarcode,
      faEdit,
      faBoxOpen,
      faMinus,
      faStore,
      faUser,
      faSignOutAlt,
      faInfoCircle,
      faQuestionCircle,
      faTimesCircle,
      faFileSignature,
      faFileDownload,
      faChevronLeft,
      faIndustry,
      faSuitcase,
      faPen,
      faEnvelope,
      faLink,
      faFolderOpen,
      faCopy,
      faArrowAltCircleDown,
      faExchangeAlt,
      faCheckSquare,
      faFileExport,
    );
  }
}
