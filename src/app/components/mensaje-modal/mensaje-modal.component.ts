import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

export enum MensajeModalType {
  INFO = 'INFO',
  ALERT = 'ALERT',
  CONFIRM = 'CONFIRM',
  ERROR = 'ERROR',
}

@Component({
  selector: 'app-mensaje-modal',
  templateUrl: './mensaje-modal.component.html',
  styleUrls: ['./mensaje-modal.component.scss']
})
export class MensajeModalComponent {
  mensaje = '';
  type = MensajeModalType.INFO;
  typeEnum = MensajeModalType;

  constructor(public activeModal: NgbActiveModal,
              private sanitaizer: DomSanitizer) { }

  getSafeHtml(): SafeHtml {
    return this.sanitaizer.bypassSecurityTrustHtml(this.mensaje);
  }
}
