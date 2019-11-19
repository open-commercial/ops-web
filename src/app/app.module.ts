import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { UsuariosService } from './services/usuarios.service';
import { LoginComponent } from './components/login/login.component';
import { MenuComponent } from './components/menu/menu.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBoostrapModule } from './modules/ng-boostrap.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { HomeComponent } from './components/home/home.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { registerLocaleData } from '@angular/common';
import localeEsAR from '@angular/common/locales/es-AR';
import localeEsARExtra from '@angular/common/locales/extra/es-AR';
import { ClienteFiltroComponent } from './components/cliente-filtro/cliente-filtro.component';
import { ClientesService } from './services/clientes.service';
import { UsuarioFiltroComponent } from './components/usuario-filtro/usuario-filtro.component';
import { ProductoFiltroComponent } from './components/producto-filtro/producto-filtro.component';
import { ProductosService } from './services/productos.service';
import { RangoFechaFiltroComponent } from './components/rango-fecha-filtro/rango-fecha-filtro.component';
import { FacturasVentaComponent } from './components/facturas-venta/facturas-venta.component';
import { FacturasCompraComponent } from './components/facturas-compra/facturas-compra.component';
import { ProveedorFiltroComponent } from './components/proveedor-filtro/proveedor-filtro.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { NuevoPedidoComponent } from './components/nuevo-pedido/nuevo-pedido.component';
import { ProductoModalComponent } from './components/producto-modal/producto-modal.component';
import { BusquedaCuentaCorrienteClienteComponent } from './components/busqueda-cuenta-corriente-cliente/busqueda-cuenta-corriente-cliente.component';
import { RenglonPedidoModalComponent } from './components/renglon-pedido-modal/renglon-pedido-modal.component';
import { CuentaCorrienteClienteModalComponent } from './components/cuenta-corriente-cliente-modal/cuenta-corriente-cliente-modal.component';
import { UbicacionFacturacionComponent } from './components/ubicacion-facturacion-component/ubicacion-facturacion.component';
import { UbicacionModalComponent } from './components/ubicacion-modal-component/ubicacion-modal.component';
import { EliminarRengloPedidoModalComponent } from './components/eliminar-renglo-pedido-modal/eliminar-renglo-pedido-modal.component';
import { UbicacionEnvioComponent } from './components/ubicacion-envio-component/ubicacion-envio.component';

library.add(fas);
registerLocaleData(localeEsAR, 'es-AR', localeEsARExtra);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MenuComponent,
    HomeComponent,
    PedidosComponent,
    ClienteFiltroComponent,
    UsuarioFiltroComponent,
    ProductoFiltroComponent,
    RangoFechaFiltroComponent,
    FacturasVentaComponent,
    FacturasCompraComponent,
    ProveedorFiltroComponent,
    TopBarComponent,
    NuevoPedidoComponent,
    ProductoModalComponent,
    BusquedaCuentaCorrienteClienteComponent,
    RenglonPedidoModalComponent,
    CuentaCorrienteClienteModalComponent,
    UbicacionFacturacionComponent,
    UbicacionEnvioComponent,
    UbicacionModalComponent,
    EliminarRengloPedidoModalComponent,
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
    AuthService,
    AuthGuard,
    UsuariosService,
    ClientesService,
    ProductosService,
  ],
  entryComponents: [
    ProductoModalComponent,
    RenglonPedidoModalComponent,
    CuentaCorrienteClienteModalComponent,
    UbicacionModalComponent,
    EliminarRengloPedidoModalComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
