import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {NotasService} from '../../services/notas.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {NotaDebito} from '../../models/nota';
import {NuevaNotaDebitoSinRecibo} from '../../models/nueva-nota-debito-sin-recibo';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {NotaDebitoVentaDetalleModalDirective} from '../nota-debito-venta-detalle-modal/nota-debito-venta-detalle-modal.directive';

@Component({
  selector: 'app-nota-debito-venta-detalle-sin-recibo-modal',
  templateUrl: '../nota-debito-venta-detalle-modal/nota-debito-venta-detalle-modal.component.html',
  styleUrls: ['../nota-debito-venta-detalle-modal/nota-debito-venta-detalle-modal.component.scss']
})
export class NotaDebitoVentaDetalleSinReciboModalComponent extends NotaDebitoVentaDetalleModalDirective implements OnInit {
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
      .subscribe(
        (nd: NotaDebito) => this.activeModal.close(nd),
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      )
    ;
  }
}
