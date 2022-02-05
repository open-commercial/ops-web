import { Component, OnInit } from '@angular/core';
import {NotaDebitoVentaDetalleModalDirective} from '../../directives/nota-debito-venta-detalle-modal.directive';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {NotasService} from '../../services/notas.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {NuevaNotaDebitoDeRecibo} from '../../models/nueva-nota-debito-de-recibo';
import {finalize} from 'rxjs/operators';
import {NotaDebito} from '../../models/nota';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-nota-debito-venta-detalle-recibo-modal',
  templateUrl: '../nota-debito-venta-detalle-modal/nota-debito-venta-detalle-modal.component.html',
  styleUrls: ['../nota-debito-venta-detalle-modal/nota-debito-venta-detalle-modal.component.scss']
})
export class NotaDebitoVentaDetalleReciboModalComponent extends NotaDebitoVentaDetalleModalDirective implements OnInit {
  nnddr: NuevaNotaDebitoDeRecibo;

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
    this.nnddr.motivo = formValues.motivo;
    this.loadingOverlayService.activate();
    this.notasService.crearNotaDebitoDeRecibo(this.nnddr)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (nd: NotaDebito) => this.activeModal.close(nd),
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      )
    ;
  }
}
