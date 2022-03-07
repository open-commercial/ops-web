import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormasDePagoComponent } from './components/formas-de-pago/formas-de-pago.component';

const routes: Routes = [{ path: '', component: FormasDePagoComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormasDePagoRoutingModule { }
