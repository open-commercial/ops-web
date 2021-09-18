import {Directive, OnInit} from '@angular/core';
import NotaCreditoDetalleModalDirective from '../../../../components/nota-credito-detalle-modal/nota-credito-detalle-modal-directive';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {NotasService} from '../../../../services/notas.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {ProveedoresService} from '../../../../services/proveedores.service';
import {Proveedor} from '../../../../models/proveedor';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';

@Directive()
export default abstract class NotaCreditoCompraDetalleModalDirective extends NotaCreditoDetalleModalDirective  implements OnInit {
  idProveedor: number;
  proveedor: Proveedor;

  protected constructor(public activeModal: NgbActiveModal,
                        protected fb: FormBuilder,
                        protected notasService: NotasService,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService,
                        protected proveedoresService: ProveedoresService)  {
    super(activeModal, fb, notasService, loadingOverlayService, mensajeService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getModel() {
    if (!this.proveedor && this.idProveedor) {
      this.loadingOverlayService.activate();
      this.proveedoresService.getProveedor(this.idProveedor)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: (p: Proveedor) => this.proveedor = p,
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }
}
