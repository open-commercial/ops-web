import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {NotasService} from '../../services/notas.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {FacturasService} from '../../services/facturas.service';
import {NotaCreditoFacturaModalDirective} from '../../directives/nota-credito-factura-modal.directive';

@Component({
  selector: 'app-nota-credito-venta-factura-modal',
  templateUrl: '../nota-credito-factura-modal/nota-credito-factura-modal.component.html',
  styleUrls: ['../nota-credito-factura-modal/nota-credito-factura-modal.component.scss']
})
export class NotaCreditoVentaFacturaModalComponent extends NotaCreditoFacturaModalDirective implements OnInit {
  constructor(public activeModal: NgbActiveModal,
              protected fb: FormBuilder,
              protected notasService: NotasService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected facturasService: FacturasService) {
    super(activeModal, fb, notasService, loadingOverlayService, mensajeService, facturasService);
  }
}
