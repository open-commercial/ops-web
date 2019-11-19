import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { FacturasVentaComponent } from './components/facturas-venta/facturas-venta.component';
import { FacturasCompraComponent } from './components/facturas-compra/facturas-compra.component';
import { NuevoPedidoComponent } from './components/nuevo-pedido/nuevo-pedido.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
    children: [
      { path: '', component: NuevoPedidoComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];

/*
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
    children: [
      { path: 'nuevo-pedido', component: NuevoPedidoComponent },
      { path: 'pedidos', component: PedidosComponent },
      { path: 'facturas-venta', component: FacturasVentaComponent },
      { path: 'facturas-compra', component: FacturasCompraComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
*/

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// runGuardsAndResolvers: 'always' + onSameUrlNavigation: 'reload' se usan para que logout funcione bien
// si el logout redirecciona a la misma ruta, ej: desde home autenticado, localStorage.clear y navigate to home.
