import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { FacturasVentaComponent } from './components/facturas-venta/facturas-venta.component';
import { FacturasCompraComponent } from './components/facturas-compra/facturas-compra.component';
import { PedidoComponent } from './components/pedido/pedido.component';
import { PedidosHomeComponent } from './components/pedidos-home/pedidos-home.component';
import { VerPedidoComponent } from './components/ver-pedido/ver-pedido.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
    children: [
      { path: '', redirectTo: '/pedidos', pathMatch: 'full' },
      { path: 'pedidos', component: PedidosHomeComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always',
        children: [
          { path: '', component: PedidosComponent },
          { path: 'nuevo', component: PedidoComponent },
          { path: 'editar/:id', component: PedidoComponent },
          { path: 'ver/:id', component: VerPedidoComponent }
        ]
      },
      { path: 'facturas-venta', component: FacturasVentaComponent, runGuardsAndResolvers: 'always' },
      { path: 'facturas-compra', component: FacturasCompraComponent, runGuardsAndResolvers: 'always' }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// runGuardsAndResolvers: 'always' + onSameUrlNavigation: 'reload' se usan para que logout funcione bien
// si el logout redirecciona a la misma ruta, ej: desde home autenticado, this.storageService.clear y navigate to home.
