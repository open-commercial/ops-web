import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SucursalesRoutingModule } from './sucursales-routing.module';
import { SucursalesComponent } from './components/sucursales/sucursales.component';
import { ShareModule } from 'src/app/modules/share.module';
import { SucursalComponent } from './components/sucursal/sucursal.component';


@NgModule({
  declarations: [
    SucursalesComponent,
    SucursalComponent
  ],
  imports: [
    CommonModule,
    SucursalesRoutingModule,
    ShareModule,
  ]
})
export class SucursalesModule { }
