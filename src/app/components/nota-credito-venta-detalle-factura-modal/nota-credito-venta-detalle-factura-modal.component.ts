import { Component, OnInit } from '@angular/core';
import NotaCreditoVentaDetalleModalComponent from '../nota-credito-venta-detalle-modal/nota-credito-venta-detalle-modal-component';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {NotasService} from '../../services/notas.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {finalize} from 'rxjs/operators';
import {NotaCredito} from '../../models/nota';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {NuevaNotaCreditoDeFactura} from '../../models/nueva-nota-credito-de-factura';
import {ClientesService} from '../../services/clientes.service';

@Component({
  selector: 'app-nota-credito-venta-detalle-factura-modal',
  templateUrl: '../nota-credito-venta-detalle-modal/nota-credito-venta-detalle-modal.component.html',
  styleUrls: ['../nota-credito-venta-detalle-modal/nota-credito-venta-detalle-modal.component.scss']
})
export class NotaCreditoVentaDetalleFacturaModalComponent extends NotaCreditoVentaDetalleModalComponent implements OnInit {

  nncf: NuevaNotaCreditoDeFactura;

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
    this.nncf.motivo = formValues.motivo;
    this.loadingOverlayService.activate();
    this.notasService.crearNotaCerditoDeFactura(this.nncf)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (nc: NotaCredito) => this.activeModal.close(nc),
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      )
    ;
  }
}
