import { Component, OnInit } from '@angular/core';
import {NotaCreditoFacturaModalDirective} from '../../../../components/nota-credito-factura-modal/nota-credito-factura-modal.directive';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {NotasService} from '../../../../services/notas.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {FacturasService} from '../../../../services/facturas.service';

@Component({
  selector: 'app-nota-credito-compra-factura-modal',
  templateUrl: '../../../../components/nota-credito-factura-modal/nota-credito-factura-modal.component.html',
  styleUrls: ['../../../../components/nota-credito-factura-modal/nota-credito-factura-modal.component.scss']
})
export class NotaCreditoCompraFacturaModalComponent extends NotaCreditoFacturaModalDirective implements OnInit {

  constructor(public activeModal: NgbActiveModal,
              protected fb: FormBuilder,
              protected notasService: NotasService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected facturasService: FacturasService) {
    super(activeModal, fb, notasService, loadingOverlayService, mensajeService, facturasService);
  }
}
