import { Component, OnInit } from '@angular/core';
import NotaCreditoCompraDetalleModalDirective from '../nota-credito-compra-detalle-modal/nota-credito-compra-detalle-modal-directive';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, Validators} from '@angular/forms';
import {NotasService} from '../../../../services/notas.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {ProveedoresService} from '../../../../services/proveedores.service';
import {NuevaNotaCreditoSinFactura} from '../../../../models/nueva-nota-credito-sin-factura';
import {HelperService} from '../../../../services/helper.service';
import {finalize} from 'rxjs/operators';
import {NotaCredito} from '../../../../models/nota';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-nota-credito-compra-sin-factura-detalle-modal',
  templateUrl: '../nota-credito-compra-detalle-modal/nota-credito-compra-detalle-modal.component.html',
  styleUrls: ['../../../../components/nota-credito-detalle-modal/nota-credito-detalle-modal.component.scss']
})
export class NotaCreditoCompraDetalleSinFacturaModalComponent extends NotaCreditoCompraDetalleModalDirective implements OnInit {
  nncsf: NuevaNotaCreditoSinFactura;
  helper = HelperService;

  constructor(public activeModal: NgbActiveModal,
              protected fb: FormBuilder,
              protected notasService: NotasService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected proveedoresService: ProveedoresService)  {
    super(activeModal, fb, notasService, loadingOverlayService, mensajeService, proveedoresService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  createForm() {
    console.log(this.notaCredito, this.nncsf);

    this.form = this.fb.group({
      fecha: [this.helper.getNgbDateFromDate(new Date()), Validators.required],
      nroNota: [0 , [Validators.required, Validators.min(0)]],
      serie: [0 , [Validators.required, Validators.min(0)]],
      cae: [0, [Validators.required, Validators.min(0)]],
      motivo: ['Devolución', Validators.required],
    });
  }

  doSubmit() {
    const formValues = this.form.value;
    this.nncsf.motivo = formValues.motivo;
    this.nncsf.detalleCompra = {
      fecha: this.helper.getDateFromNgbDate(formValues.fecha),
      nroNota: formValues.nroNota,
      serie: formValues.serie,
      CAE: formValues.cae,
    };

    this.loadingOverlayService.activate();
    this.notasService.crearNotaCerditoSinFactura(this.nncsf)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (nc: NotaCredito) => this.activeModal.close(nc),
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }
}
