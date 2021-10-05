import { Component, OnInit } from '@angular/core';
import {NuevaNotaDebitoSinRecibo} from '../../../../models/nueva-nota-debito-sin-recibo';
import {finalize} from 'rxjs/operators';
import {NotaDebito} from '../../../../models/nota';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';
import {NotaDebitoCompraDetalleModalDirective} from '../nota-debito-compra-detalle-modal/nota-debito-compra-detalle-modal.directive';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {NotasService} from '../../../../services/notas.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';

@Component({
  selector: 'app-nota-debito-compra-detalle-sin-recibo-modal',
  templateUrl: '../nota-debito-compra-detalle-modal/nota-debito-compra-detalle-modal.component.html',
  styleUrls: ['../nota-debito-compra-detalle-modal/nota-debito-compra-detalle-modal.component.scss']
})
export class NotaDebitoCompraDetalleSinReciboModalComponent extends NotaDebitoCompraDetalleModalDirective implements OnInit {
  nndsr: NuevaNotaDebitoSinRecibo;
  constructor(public activeModal: NgbActiveModal,
              protected fb: FormBuilder,
              protected notasService: NotasService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService) {
    super(activeModal, fb, notasService, loadingOverlayService, mensajeService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  doSubmit() {
    const formValues = this.form.value;
    this.nndsr.motivo = formValues.motivo;
    this.loadingOverlayService.activate();
    this.notasService.crearNotaDebitoSinRecibo(this.nndsr)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (nd: NotaDebito) => this.activeModal.close(nd),
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }
}
