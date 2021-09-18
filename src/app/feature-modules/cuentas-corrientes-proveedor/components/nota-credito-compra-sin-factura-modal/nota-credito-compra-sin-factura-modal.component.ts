import { Component, OnInit } from '@angular/core';
import {NotaCreditoSinFacturaModalDirective} from '../../../../components/nota-credito-sin-factura-modal/nota-credito-sin-factura-modal.directive';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {SucursalesService} from '../../../../services/sucursales.service';
import {NotasService} from '../../../../services/notas.service';
import {Proveedor} from '../../../../models/proveedor';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';
import {NuevaNotaCreditoSinFactura} from '../../../../models/nueva-nota-credito-sin-factura';

@Component({
  selector: 'app-nota-credito-compra-sin-factura-modal',
  templateUrl: '../../../../components/nota-credito-sin-factura-modal/nota-credito-sin-factura-modal.component.html'
})
export class NotaCreditoCompraSinFacturaModalComponent extends NotaCreditoSinFacturaModalDirective implements OnInit {
  proveedor: Proveedor;

  constructor(public activeModal: NgbActiveModal,
              protected fb: FormBuilder,
              public loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected sucursalesService: SucursalesService,
              protected notasService: NotasService) {
    super(activeModal, fb, loadingOverlayService, mensajeService, sucursalesService, notasService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  getTiposDeComprobante() {
    this.loading = true;
    this.notasService.getTiposDeNotaCreditoProveedorSucursal(
      this.proveedor.idProveedor, this.sucursalesService.getIdSucursal()
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
      idProveedor: this.proveedor.idProveedor,
      idSucursal: this.sucursalesService.getIdSucursal(),
      tipo: formValues.tipoDeComprobante,
      detalle: formValues.descripcion,
      monto: formValues.monto,
    };
  }
}
