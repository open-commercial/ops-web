import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransportistasRoutingModule } from './transportistas-routing.module';
import { TransportistasComponent } from './components/transportistas/transportistas.component';
import { ShareModule } from '../../modules/share.module';
import { TransportistaComponent } from './components/transportista/transportista.component';


@NgModule({
  declarations: [
    TransportistasComponent,
    TransportistaComponent
  ],
  imports: [
    CommonModule,
    ShareModule,
    TransportistasRoutingModule
  ]
})
export class TransportistasModule { }
