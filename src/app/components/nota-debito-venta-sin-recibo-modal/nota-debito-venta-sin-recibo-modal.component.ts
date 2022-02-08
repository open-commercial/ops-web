import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {SucursalesService} from '../../services/sucursales.service';
import {NotasService} from '../../services/notas.service';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {NuevaNotaDebitoSinRecibo} from '../../models/nueva-nota-debito-sin-recibo';
import {NotaDebitoVentaModalDirective} from '../../directives/nota-debito-venta-modal.directive';

@Component({
  selector: 'app-nota-debito-venta-sin-recibo-modal',
  templateUrl: '../nota-debito-modal/nota-debito-modal.component.html'
})
export class NotaDebitoVentaSinReciboModalComponent extends NotaDebitoVentaModalDirective implements OnInit {
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
      idCliente: this.cliente.idCliente,
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
