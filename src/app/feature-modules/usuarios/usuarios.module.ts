import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsuariosRoutingModule } from './usuarios-routing.module';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { ShareModule } from '../../modules/share.module';
import { UsuarioComponent } from './components/usuario/usuario.component';


@NgModule({
  declarations: [
    UsuariosComponent,
    UsuarioComponent
  ],
  imports: [
    CommonModule,
    ShareModule,
    UsuariosRoutingModule
  ]
})
export class UsuariosModule { }
