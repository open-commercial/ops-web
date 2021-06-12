import {NotaCredito} from '../../models/nota';
import {Cliente} from '../../models/cliente';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {NotasService} from '../../services/notas.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {OnInit} from '@angular/core';
import {TipoDeComprobante} from '../../models/tipo-de-comprobante';

export default abstract class NotaCreditoVentaDetalleModalComponent implements OnInit {
  notaCredito: NotaCredito;
  cliente: Cliente;
  form: FormGroup;
  submitted = false;
  loading = false;

  protected constructor(public activeModal: NgbActiveModal,
                        protected fb: FormBuilder,
                        protected notasService: NotasService,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService) {}

  ngOnInit() {
    this.createForm();
  }

  getTitle() {
    let title = 'Nueva Nota de Crédito ';
    switch (this.notaCredito.tipoComprobante) {
      case TipoDeComprobante.NOTA_CREDITO_A:
        title += '"A"';
        break;
      case TipoDeComprobante.NOTA_CREDITO_B:
        title += '"B"';
        break;
      case TipoDeComprobante.NOTA_CREDITO_C:
        title += '"C"';
        break;
      case TipoDeComprobante.NOTA_CREDITO_X:
        title += '"X"';
        break;
      case TipoDeComprobante.NOTA_CREDITO_Y:
        title += '"Y"';
        break;
      case TipoDeComprobante.NOTA_CREDITO_PRESUPUESTO:
        title += '"P"';
        break;
      default:
        throw new Error('El tipo de comprobante no es una nota de crédito.');
        // break;
    }
    return title;
  }

  createForm() {
    this.form = this.fb.group({
      motivo: ['Devolución', Validators.required],
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      this.doSubmit();
    }
  }

  abstract doSubmit();
}
