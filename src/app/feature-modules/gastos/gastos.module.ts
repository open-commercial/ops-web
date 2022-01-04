import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GastosRoutingModule } from './gastos-routing.module';
import { GastosComponent } from './components/gastos/gastos.component';
import { ShareModule } from '../../modules/share.module';
import { VerGastoComponent } from './components/ver-gasto/ver-gasto.component';
import { GastoComponent } from './components/gasto/gasto.component';

@NgModule({
  declarations: [
    GastosComponent,
    VerGastoComponent,
    GastoComponent
  ],
  imports: [
    CommonModule,
    GastosRoutingModule,
    ShareModule,
  ]
})
export class GastosModule { }
