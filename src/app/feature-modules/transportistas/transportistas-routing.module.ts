import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransportistasComponent } from './components/transportistas/transportistas.component';
import { TransportistaComponent } from './components/transportista/transportista.component';

const routes: Routes = [
  { path: '', component: TransportistasComponent },
  { path: 'nuevo', component: TransportistaComponent },
  { path: 'editar/:id', component: TransportistaComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportistasRoutingModule { }
