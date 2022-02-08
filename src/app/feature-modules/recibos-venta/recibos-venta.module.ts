import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecibosVentaRoutingModule } from './recibos-venta-routing.module';
import { RecibosVentaComponent } from './componentes/recibos-venta/recibos-venta.component';
import {ShareModule} from '../../modules/share.module';


@NgModule({
  declarations: [
    RecibosVentaComponent
  ],
  imports: [
    CommonModule,
    RecibosVentaRoutingModule,
    ShareModule
  ]
})
export class RecibosVentaModule { }
