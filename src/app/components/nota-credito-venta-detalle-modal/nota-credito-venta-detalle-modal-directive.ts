import {Cliente} from '../../models/cliente';
import {FormBuilder} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {NotasService} from '../../services/notas.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import { OnInit, Directive } from '@angular/core';
import {ClientesService} from '../../services/clientes.service';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import NotaCreditoDetalleModalDirective from '../nota-credito-detalle-modal/nota-credito-detalle-modal-directive';

@Directive()
export default abstract class NotaCreditoVentaDetalleModalDirective extends NotaCreditoDetalleModalDirective  implements OnInit {
  idCliente: number;
  cliente: Cliente;

  protected constructor(public activeModal: NgbActiveModal,
                        protected fb: FormBuilder,
                        protected notasService: NotasService,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService,
                        protected clientesService: ClientesService) {
    super(activeModal, fb, notasService, loadingOverlayService, mensajeService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getModel() {
    if (!this.cliente && this.idCliente) {
      this.loadingOverlayService.activate();
      this.clientesService.getCliente(this.idCliente)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: (c: Cliente) => this.cliente = c,
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }
}
