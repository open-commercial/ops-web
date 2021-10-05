import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, Validators} from '@angular/forms';
import {NotasService} from '../../../../services/notas.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {NotaDebitoDetalleModalDirective} from '../../../../components/nota-debito-detalle-modal/nota-debito-detalle-modal.directive';
import {Directive, OnInit} from '@angular/core';
import {Proveedor} from '../../../../models/proveedor';
import {HelperService} from '../../../../services/helper.service';

@Directive()
export abstract class NotaDebitoCompraDetalleModalDirective extends NotaDebitoDetalleModalDirective implements OnInit {
  proveedor: Proveedor;
  helper = HelperService;

  protected constructor(public activeModal: NgbActiveModal,
                        protected fb: FormBuilder,
                        protected notasService: NotasService,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService) {
    super(activeModal, fb, notasService, loadingOverlayService, mensajeService);
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      fecha: [this.helper.getNgbDateFromDate(new Date()), Validators.required],
      nroNota: [0 , [Validators.required, Validators.min(0)]],
      serie: [0 , [Validators.required, Validators.min(0)]],
      cae: [0, [Validators.required, Validators.min(0)]],
      motivo: ['Devolución', Validators.required],
    });
  }
}
