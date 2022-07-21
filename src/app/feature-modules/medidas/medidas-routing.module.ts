import { MedidaComponent } from './components/medida/medida.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MedidasComponent } from './components/medidas/medidas.component';

const routes: Routes = [
  { path: '', component: MedidasComponent },
  { path: 'nueva', component: MedidaComponent },
  { path: 'editar/:id', component: MedidaComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedidasRoutingModule { }
