import { Injectable } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { MensajeModalComponent, MensajeModalType } from '../components/mensaje-modal/mensaje-modal.component';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {

  constructor(config: NgbModalConfig, private modalService: NgbModal) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  msg(mensaje: string, type: MensajeModalType = MensajeModalType.ALERT) {
    const modalRef = this.modalService.open(MensajeModalComponent);
    modalRef.componentInstance.mensaje = mensaje;
    modalRef.componentInstance.type = type;
    return modalRef.result;
  }
}
