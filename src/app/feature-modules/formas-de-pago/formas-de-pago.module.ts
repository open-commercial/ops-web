import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormasDePagoRoutingModule } from './formas-de-pago-routing.module';
import { FormasDePagoComponent } from './components/formas-de-pago/formas-de-pago.component';
import {ShareModule} from '../../modules/share.module';


@NgModule({
  declarations: [
    FormasDePagoComponent
  ],
  imports: [
    CommonModule,
    FormasDePagoRoutingModule,
    ShareModule,
  ]
})
export class FormasDePagoModule { }
