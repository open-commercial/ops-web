import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GastosComponent } from './components/gastos/gastos.component';
import {VerGastoComponent} from './components/ver-gasto/ver-gasto.component';
import {GastoComponent} from './components/gasto/gasto.component';

const routes: Routes = [
  { path: '', component: GastosComponent },
  { path: 'ver/:id', component: VerGastoComponent },
  { path: 'nuevo', component: GastoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GastosRoutingModule { }
