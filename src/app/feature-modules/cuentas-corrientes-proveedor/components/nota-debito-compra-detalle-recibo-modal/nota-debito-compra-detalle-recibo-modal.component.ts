import { Component } from '@angular/core';
import {NotaDebitoCompraDetalleModalDirective} from '../nota-debito-compra-detalle-modal/nota-debito-compra-detalle-modal.directive';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {NotasService} from '../../../../services/notas.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {NuevaNotaDebitoDeRecibo} from '../../../../models/nueva-nota-debito-de-recibo';
import {finalize} from 'rxjs/operators';
import {NotaDebito} from '../../../../models/nota';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-nota-debito-compra-detalle-recibo-modal',
  templateUrl: '../nota-debito-compra-detalle-modal/nota-debito-compra-detalle-modal.component.html',
  styleUrls: ['../nota-debito-compra-detalle-modal/nota-debito-compra-detalle-modal.component.scss']
})
export class NotaDebitoCompraDetalleReciboModalComponent extends NotaDebitoCompraDetalleModalDirective {
  nndr: NuevaNotaDebitoDeRecibo;
  constructor(public activeModal: NgbActiveModal,
              protected fb: FormBuilder,
              protected notasService: NotasService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService) {
    super(activeModal, fb, notasService, loadingOverlayService, mensajeService);
  }

  doSubmit() {
    const formValues = this.form.value;
    this.nndr.motivo = formValues.motivo;
    this.loadingOverlayService.activate();
    this.notasService.crearNotaDebitoDeRecibo(this.nndr)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (nd: NotaDebito) => this.activeModal.close(nd),
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }
}
