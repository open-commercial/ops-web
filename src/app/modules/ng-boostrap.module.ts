import { NgModule } from '@angular/core';
import {NgbAlertModule, NgbCollapseModule, NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    NgbAlertModule, NgbCollapseModule, NgbDropdownModule
  ],
  exports: [
    NgbAlertModule, NgbCollapseModule, NgbDropdownModule
  ]
})
export class NgBoostrapModule { }
