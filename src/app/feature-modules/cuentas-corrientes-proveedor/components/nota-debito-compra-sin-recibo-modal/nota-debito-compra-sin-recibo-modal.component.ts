import { Component, OnInit } from '@angular/core';
import {NotaDebitoCompraModalDirective} from '../nota-debito-compra-modal/nota-debito-compra-modal.directive';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {SucursalesService} from '../../../../services/sucursales.service';
import {NotasService} from '../../../../services/notas.service';
import {NuevaNotaDebitoSinRecibo} from '../../../../models/nueva-nota-debito-sin-recibo';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-nota-debito-compra-sin-recibo-modal',
  templateUrl: '../../../../components/nota-debito-modal/nota-debito-modal.component.html'
})
export class NotaDebitoCompraSinReciboModalComponent extends NotaDebitoCompraModalDirective implements OnInit {

  constructor(public activeModal: NgbActiveModal,
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

  doSubmit() {
    const formValues = this.form.value;
    const nnd: NuevaNotaDebitoSinRecibo = {
      idProveedor: this.proveedor.idProveedor,
      idSucursal: this.sucursalesService.getIdSucursal(),
      tipoDeComprobante: formValues.tipoDeComprobante,
      gastoAdministrativo: formValues.gastoAdministrativo,
      motivo: '',
    };

    this.loadingOverlayService.activate();
    this.notasService.calcularNotaDebitoSinRecibo(nnd)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: nd => this.activeModal.close([nnd, nd]),
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

}
