import { NgModule } from '@angular/core';
import {
  NgbAccordionModule,
  NgbAlertModule, NgbButtonsModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbDropdownModule, NgbModalModule,
  NgbPopoverModule, NgbTypeaheadModule
} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    NgbAlertModule, NgbCollapseModule, NgbDropdownModule, NgbDatepickerModule, NgbPopoverModule, NgbAccordionModule,
    NgbModalModule, NgbTypeaheadModule, NgbButtonsModule
  ],
  exports: [
    NgbAlertModule, NgbCollapseModule, NgbDropdownModule, NgbDatepickerModule, NgbPopoverModule, NgbAccordionModule,
    NgbModalModule, NgbTypeaheadModule, NgbButtonsModule
  ]
})
export class NgBoostrapModule { }
