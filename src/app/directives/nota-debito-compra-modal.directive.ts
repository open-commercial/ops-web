import {NotaDebitoModalDirective} from './nota-debito-modal.directive';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {LoadingOverlayService} from '../services/loading-overlay.service';
import {MensajeService} from '../services/mensaje.service';
import {SucursalesService} from '../services/sucursales.service';
import {NotasService} from '../services/notas.service';
import {Directive, OnInit} from '@angular/core';
import {Proveedor} from '../models/proveedor';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../components/mensaje-modal/mensaje-modal.component';

@Directive()
export abstract class NotaDebitoCompraModalDirective extends NotaDebitoModalDirective implements OnInit {
  proveedor: Proveedor;
  protected constructor(public activeModal: NgbActiveModal,
                        protected fb: FormBuilder,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService,
                        protected sucursalesService: SucursalesService,
                        protected notasService: NotasService) {
    super(activeModal, fb, loadingOverlayService, mensajeService, sucursalesService, notasService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getTiposDeComprobantes() {
    this.loading = true;
    this.notasService.getTiposDeNotaDebitoProveedorSucursal(
      this.proveedor.idProveedor, this.sucursalesService.getIdSucursal()
    )
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: data => this.tiposDeComprobantes = data,
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }
}
