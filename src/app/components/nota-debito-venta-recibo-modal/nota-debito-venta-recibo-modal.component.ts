import {Component, OnInit} from '@angular/core';
import {NotaDebitoVentaModalComponent} from '../nota-debito-venta-modal/nota-debito-venta-modal.component';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {SucursalesService} from '../../services/sucursales.service';
import {NotasService} from '../../services/notas.service';
import {NuevaNotaDebitoDeRecibo} from '../../models/nueva-nota-debito-de-recibo';
import {finalize} from 'rxjs/operators';
import {NotaDebito} from '../../models/nota';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-nota-debito-venta-recibo-modal',
  templateUrl: '../nota-debito-venta-modal/nota-debito-venta-modal.component.html',
  styleUrls: ['../nota-debito-venta-modal/nota-debito-venta-modal.component.scss']
})
export class NotaDebitoVentaReciboModalComponent extends NotaDebitoVentaModalComponent implements OnInit {
  idRecibo: number;
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
    const nnd: NuevaNotaDebitoDeRecibo = {
      idRecibo: this.idRecibo,
      tipoDeComprobante: formValues.tipoDeComprobante,
      gastoAdministrativo: formValues.gastoAdministrativo,
      motivo: ''
    };
    this.loadingOverlayService.activate();
    this.notasService.calcularNotaDebitoDeRecibo(nnd)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (nd: NotaDebito) => this.activeModal.close([nnd, nd]),
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      )
    ;
  }
}
