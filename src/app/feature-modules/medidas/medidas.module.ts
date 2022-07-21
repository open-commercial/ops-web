import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from 'src/app/modules/share.module';

import { MedidasRoutingModule } from './medidas-routing.module';
import { MedidasComponent } from './components/medidas/medidas.component';
import { MedidaComponent } from './components/medida/medida.component';


@NgModule({
  declarations: [
    MedidasComponent,
    MedidaComponent
  ],
  imports: [
    CommonModule,
    MedidasRoutingModule,
    ShareModule
  ]
})
export class MedidasModule { }
