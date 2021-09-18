import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {NotasService} from '../../services/notas.service';
import {SucursalesService} from '../../services/sucursales.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {finalize} from 'rxjs/operators';
import {MensajeService} from '../../services/mensaje.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {NuevaNotaCreditoSinFactura} from '../../models/nueva-nota-credito-sin-factura';
import {Cliente} from '../../models/cliente';
import {NotaCreditoSinFacturaModalDirective} from '../nota-credito-sin-factura-modal/nota-credito-sin-factura-modal.directive';

@Component({
  selector: 'app-nota-credito-venta-sin-factura-modal',
  templateUrl: '../nota-credito-sin-factura-modal/nota-credito-sin-factura-modal.component.html'
})
export class NotaCreditoVentaSinFacturaModalComponent extends NotaCreditoSinFacturaModalDirective implements OnInit {

  cliente: Cliente;

  constructor(public activeModal: NgbActiveModal,
              protected fb: FormBuilder,
              public loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected sucursalesService: SucursalesService,
              protected notasService: NotasService) {
    super(activeModal, fb, loadingOverlayService, mensajeService, sucursalesService, notasService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getTiposDeComprobante() {
    this.loading = true;
    this.notasService.getTiposDeNotaCreditoClienteSucursal(
      this.cliente.idCliente, this.sucursalesService.getIdSucursal()
    )
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: data => this.tiposDeComprobantes = data,
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

  getNuevaNotaCreditoSinFactura(): NuevaNotaCreditoSinFactura {
    const formValues = this.form.value;
    return {
      idCliente: this.cliente.idCliente,
      idSucursal: this.sucursalesService.getIdSucursal(),
      tipo: formValues.tipoDeComprobante,
      detalle: formValues.descripcion,
      monto: formValues.monto,
    };
  }
}
