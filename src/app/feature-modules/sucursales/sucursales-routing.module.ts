import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SucursalesComponent } from './components/sucursales/sucursales.component';
import { SucursalComponent } from './components/sucursal/sucursal.component';

const routes: Routes = [
  { path: '', component: SucursalesComponent },
  { path: 'nueva', component: SucursalComponent },
  { path: 'editar/:id', component: SucursalComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SucursalesRoutingModule { }
