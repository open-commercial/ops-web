import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecibosVentaRoutingModule } from './recibos-venta-routing.module';
import { RecibosVentaComponent } from './componentes/recibos-venta.component';


@NgModule({
  declarations: [
    RecibosVentaComponent
  ],
  imports: [
    CommonModule,
    RecibosVentaRoutingModule
  ]
})
export class RecibosVentaModule { }
