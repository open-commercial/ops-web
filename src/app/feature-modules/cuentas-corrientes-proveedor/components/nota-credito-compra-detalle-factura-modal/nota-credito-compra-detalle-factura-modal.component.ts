import { Component, OnInit } from '@angular/core';
import NotaCreditoCompraDetalleModalDirective from '../../../../directives/nota-credito-compra-detalle-modal-directive';
import {NuevaNotaCreditoDeFactura} from '../../../../models/nueva-nota-credito-de-factura';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {NotasService} from '../../../../services/notas.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {ProveedoresService} from '../../../../services/proveedores.service';
import {finalize} from 'rxjs/operators';
import {NotaCredito} from '../../../../models/nota';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-nota-credito-compra-detalle-factura-modal',
  templateUrl: '../nota-credito-compra-detalle-modal/nota-credito-compra-detalle-modal.component.html',
  styleUrls: ['../../../../components/nota-credito-detalle-modal/nota-credito-detalle-modal.component.scss']
})
export class NotaCreditoCompraDetalleFacturaModalComponent extends NotaCreditoCompraDetalleModalDirective implements OnInit {
  nncf: NuevaNotaCreditoDeFactura;

  constructor(public activeModal: NgbActiveModal,
              protected fb: FormBuilder,
              protected notasService: NotasService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected proveedoresService: ProveedoresService)  {
    super(activeModal, fb, notasService, loadingOverlayService, mensajeService, proveedoresService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  doSubmit() {
    const formValues = this.form.value;
    this.nncf.motivo = formValues.motivo;
    this.nncf.detalleCompra = {
      fecha: this.helper.getDateFromNgbDate(formValues.fecha),
      nroNota: formValues.nroNota,
      serie: formValues.serie,
      cae: formValues.cae,
    };

    this.loadingOverlayService.activate();
    this.notasService.crearNotaCreditoDeFactura(this.nncf)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (nc: NotaCredito) => this.activeModal.close(nc),
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }
}
