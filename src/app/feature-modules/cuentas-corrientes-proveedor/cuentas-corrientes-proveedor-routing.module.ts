import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CuentasCorrientesProveedorComponent} from './components/cuentas-corrientes-proveedor/cuentas-corrientes-proveedor.component';
import { CuentaCorrienteProveedorComponent } from './components/cuenta-corriente-proveedor/cuenta-corriente-proveedor.component';
import {ProveedorComponent} from './components/proveedor/proveedor.component';

const routes: Routes = [
  { path: '', component: CuentasCorrientesProveedorComponent },
  { path: 'nuevo', component: ProveedorComponent },
  { path: 'editar/:id', component: ProveedorComponent },
  { path: 'cuenta-corriente/:id', component: CuentaCorrienteProveedorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CuentasCorrientesProveedorRoutingModule { }
