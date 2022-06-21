import { RubroComponent } from './components/rubro/rubro.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RubrosComponent } from './components/rubros/rubros.component';

const routes: Routes = [
  { path: '', component: RubrosComponent },
  { path: 'nuevo', component: RubroComponent },
  { path: 'editar/:id', component: RubroComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RubrosRoutingModule { }
