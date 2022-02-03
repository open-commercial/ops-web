import {Directive, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {SucursalesService} from '../../services/sucursales.service';
import {NotasService} from '../../services/notas.service';
import {Cliente} from '../../models/cliente';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {NotaDebitoModalDirective} from '../nota-debito-modal/nota-debito-modal.directive';

@Directive()
export abstract class NotaDebitoVentaModalDirective extends NotaDebitoModalDirective implements OnInit {
  cliente: Cliente;
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
    this.notasService.getTiposDeNotaDebitoClienteSucursal(this.cliente.idCliente, this.sucursalesService.getIdSucursal())
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: data => this.tiposDeComprobantes = data,
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }
}
