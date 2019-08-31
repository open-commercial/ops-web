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
  bootstrap: [AppComponent]
})
export class AppModule { }
