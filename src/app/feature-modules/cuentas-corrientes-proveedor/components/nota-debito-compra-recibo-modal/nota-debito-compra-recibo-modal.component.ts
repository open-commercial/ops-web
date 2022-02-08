import { Component } from '@angular/core';
import {NotaDebitoCompraModalDirective} from '../../../../directives/nota-debito-compra-modal.directive';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {SucursalesService} from '../../../../services/sucursales.service';
import {NotasService} from '../../../../services/notas.service';
import {NuevaNotaDebitoDeRecibo} from '../../../../models/nueva-nota-debito-de-recibo';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-nota-debito-compra-recibo-modal',
  templateUrl: '../../../../components/nota-debito-modal/nota-debito-modal.component.html',
})
export class NotaDebitoCompraReciboModalComponent extends NotaDebitoCompraModalDirective {
  idRecibo: number;
  constructor(public activeModal: NgbActiveModal,
              protected fb: FormBuilder,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected sucursalesService: SucursalesService,
              protected notasService: NotasService) {
    super(activeModal, fb, loadingOverlayService, mensajeService, sucursalesService, notasService);
  }

  doSubmit() {
    const formValues = this.form.value;
    const nnd: NuevaNotaDebitoDeRecibo = {
      idRecibo: this.idRecibo,
      tipoDeComprobante: formValues.tipoDeComprobante,
      gastoAdministrativo: formValues.gastoAdministrativo,
      motivo: ''
    };

    this.loadingOverlayService.activate();
    this.notasService.calcularNotaDebitoDeRecibo(nnd)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: nd => this.activeModal.close([nnd, nd]),
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

}
