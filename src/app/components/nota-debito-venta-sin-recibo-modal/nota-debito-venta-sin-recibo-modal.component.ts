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
import {NotaDebitoVentaModalComponent} from '../nota-debito-venta-modal/nota-debito-venta-modal.component';

@Component({
  selector: 'app-nota-debito-venta-sin-recibo-modal',
  templateUrl: '../nota-debito-venta-modal/nota-debito-venta-modal.component.html',
  styleUrls: ['../nota-debito-venta-modal/nota-debito-venta-modal.component.scss']
})
export class NotaDebitoVentaSinReciboModalComponent extends NotaDebitoVentaModalComponent implements OnInit {
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
      .subscribe(
        nd => this.activeModal.close([nnd, nd]),
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      )
    ;
  }
}
