import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecibosCompraRoutingModule } from './recibos-compra-routing.module';
import { RecibosCompraComponent } from './components/recibos-compra/recibos-compra.component';
import {ShareModule} from '../../modules/share.module';


@NgModule({
  declarations: [
    RecibosCompraComponent
  ],
  imports: [
    CommonModule,
    RecibosCompraRoutingModule,
    ShareModule
  ]
})
export class RecibosCompraModule { }
