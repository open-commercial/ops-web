import { NgModule } from '@angular/core';
import {
  NgbAccordionModule,
  NgbAlertModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbDropdownModule, NgbModalModule,
  NgbPopoverModule, NgbTypeaheadModule
} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    NgbAlertModule, NgbCollapseModule, NgbDropdownModule, NgbDatepickerModule, NgbPopoverModule, NgbAccordionModule,
    NgbModalModule, NgbTypeaheadModule
  ],
  exports: [
    NgbAlertModule, NgbCollapseModule, NgbDropdownModule, NgbDatepickerModule, NgbPopoverModule, NgbAccordionModule,
    NgbModalModule, NgbTypeaheadModule
  ]
})
export class NgBoostrapModule { }
