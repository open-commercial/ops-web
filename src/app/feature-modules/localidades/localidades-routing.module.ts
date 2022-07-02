import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LocalidadComponent } from './components/localidad/localidad.component';
import { LocalidadesComponent } from './components/localidades/localidades.component';

const routes: Routes = [
  { path: '', component: LocalidadesComponent },
  { path: 'editar/:id', component: LocalidadComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocalidadesRoutingModule { }
