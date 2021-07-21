import {Component, OnInit} from '@angular/core';
import {NotaCredito} from '../../models/nota';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {MensajeService} from '../../services/mensaje.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {NotasService} from '../../services/notas.service';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import Big from 'big.js';
import {NuevaNotaCreditoSinFactura} from '../../models/nueva-nota-credito-sin-factura';
import NotaCreditoVentaDetalleModalComponent from '../nota-credito-venta-detalle-modal/nota-credito-venta-detalle-modal-component';
import {ClientesService} from '../../services/clientes.service';

Big.DP = 15;

@Component({
  selector: 'app-nota-credito-venta-detalle-sin-factura-modal',
  templateUrl: '../nota-credito-venta-detalle-modal/nota-credito-venta-detalle-modal.component.html',
  styleUrls: ['../nota-credito-venta-detalle-modal/nota-credito-venta-detalle-modal.component.scss']
})
export class NotaCreditoVentaDetalleSinFacturaModalComponent extends NotaCreditoVentaDetalleModalComponent implements OnInit {
  nncsf: NuevaNotaCreditoSinFactura;

  constructor(public activeModal: NgbActiveModal,
              protected fb: FormBuilder,
              protected notasService: NotasService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected clientesService: ClientesService) {
    super(activeModal, fb, notasService, loadingOverlayService, mensajeService, clientesService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  doSubmit() {
    const formValues = this.form.value;
    this.nncsf.motivo = formValues.motivo;
    this.loadingOverlayService.activate();
    this.notasService.crearNotaCerditoSinFactura(this.nncsf)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (nc: NotaCredito) => this.activeModal.close(nc),
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      )
    ;
  }
}
