import { NgModule } from '@angular/core';
import {
  NgbAccordionModule,
  NgbAlertModule, NgbButtonsModule,
  NgbCollapseModule, NgbDateParserFormatter,
  NgbDatepickerModule,
  NgbDropdownModule, NgbModalModule,
  NgbPopoverModule, NgbTypeaheadModule
} from '@ng-bootstrap/ng-bootstrap';
import { MomentDateFormatter } from '../formatters/moment-date-formatter';

@NgModule({
  imports: [
    NgbAlertModule, NgbCollapseModule, NgbDropdownModule, NgbDatepickerModule, NgbPopoverModule, NgbAccordionModule,
    NgbModalModule, NgbTypeaheadModule, NgbButtonsModule
  ],
  exports: [
    NgbAlertModule, NgbCollapseModule, NgbDropdownModule, NgbDatepickerModule, NgbPopoverModule, NgbAccordionModule,
    NgbModalModule, NgbTypeaheadModule, NgbButtonsModule
  ],
  providers: [{ provide: NgbDateParserFormatter, useValue: new MomentDateFormatter() }]
})
export class NgBoostrapModule { }
