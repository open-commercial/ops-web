import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from 'src/app/modules/share.module';

import { RubrosRoutingModule } from './rubros-routing.module';
import { RubrosComponent } from './components/rubros/rubros.component';
import { RubroComponent } from './components/rubro/rubro.component';


@NgModule({
  declarations: [
    RubrosComponent,
    RubroComponent
  ],
  imports: [
    CommonModule,
    RubrosRoutingModule,
    ShareModule,
  ]
})
export class RubrosModule { }
