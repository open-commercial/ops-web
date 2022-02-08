import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecibosCompraComponent } from './components/recibos-compra/recibos-compra.component';

const routes: Routes = [{ path: '', component: RecibosCompraComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecibosCompraRoutingModule { }
