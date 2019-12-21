import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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
export class MensajeModalComponent implements OnInit {
  mensaje = '';
  type = MensajeModalType.INFO;
  typeEnum = MensajeModalType;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }
}
