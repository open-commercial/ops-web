import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocalidadesRoutingModule } from './localidades-routing.module';
import { LocalidadesComponent } from './components/localidades/localidades.component';
import { ShareModule } from 'src/app/modules/share.module';
import { LocalidadComponent } from './components/localidad/localidad.component';


@NgModule({
  declarations: [
    LocalidadesComponent,
    LocalidadComponent
  ],
  imports: [
    CommonModule,
    LocalidadesRoutingModule,
    ShareModule
  ]
})
export class LocalidadesModule { }
