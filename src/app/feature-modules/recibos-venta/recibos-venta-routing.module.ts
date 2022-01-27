import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecibosVentaComponent } from './componentes/recibos-venta.component';

const routes: Routes = [{ path: '', component: RecibosVentaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecibosVentaRoutingModule { }
