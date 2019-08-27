import { NgModule } from '@angular/core';
import {
  NgbAlertModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbDropdownModule,
  NgbPaginationModule, NgbPopoverModule
} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    NgbAlertModule, NgbCollapseModule, NgbDropdownModule, NgbPaginationModule, NgbDatepickerModule, NgbPopoverModule
  ],
  exports: [
    NgbAlertModule, NgbCollapseModule, NgbDropdownModule, NgbPaginationModule, NgbDatepickerModule, NgbPopoverModule
  ]
})
export class NgBoostrapModule { }
