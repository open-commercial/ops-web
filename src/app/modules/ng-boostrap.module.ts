import { NgModule } from '@angular/core';
import {
  NgbAccordionModule,
  NgbAlertModule, NgbButtonsModule,
  NgbCollapseModule, NgbDateParserFormatter,
  NgbDatepickerModule,
  NgbDropdownModule, NgbModalModule, NgbPaginationModule,
  NgbPopoverModule, NgbTypeaheadModule
} from '@ng-bootstrap/ng-bootstrap';
import { MomentDateFormatter } from '../formatters/moment-date-formatter';

@NgModule({
  imports: [
    NgbAlertModule, NgbCollapseModule, NgbDropdownModule, NgbDatepickerModule, NgbPopoverModule, NgbAccordionModule,
    NgbModalModule, NgbTypeaheadModule, NgbButtonsModule, NgbPaginationModule
  ],
  exports: [
    NgbAlertModule, NgbCollapseModule, NgbDropdownModule, NgbDatepickerModule, NgbPopoverModule, NgbAccordionModule,
    NgbModalModule, NgbTypeaheadModule, NgbButtonsModule, NgbPaginationModule
  ],
  providers: [{ provide: NgbDateParserFormatter, useValue: new MomentDateFormatter() }]
})
export class NgBoostrapModule { }
