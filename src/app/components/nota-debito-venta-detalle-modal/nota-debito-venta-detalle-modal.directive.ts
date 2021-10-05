import {Cliente} from '../../models/cliente';
import {FormBuilder} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {NotasService} from '../../services/notas.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import { OnInit, Directive } from '@angular/core';
import {NotaDebitoDetalleModalDirective} from '../nota-debito-detalle-modal/nota-debito-detalle-modal.directive';

@Directive()
export abstract class NotaDebitoVentaDetalleModalDirective extends NotaDebitoDetalleModalDirective implements OnInit {
  cliente: Cliente;

  protected constructor(public activeModal: NgbActiveModal,
                        protected fb: FormBuilder,
                        protected notasService: NotasService,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService) {
    super(activeModal, fb, notasService, loadingOverlayService, mensajeService);
  }

  ngOnInit() {
    this.createForm();
  }
}
