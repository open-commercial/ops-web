import {NotaDebito} from '../../models/nota';
import {Cliente} from '../../models/cliente';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {NotasService} from '../../services/notas.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {OnInit} from '@angular/core';
import {TipoDeComprobante} from '../../models/tipo-de-comprobante';

export abstract class NotaDebitoVentaDetalleModalComponent implements OnInit {
  notaDebito: NotaDebito;
  cliente: Cliente;
  form: FormGroup;
  submitted = false;
  loading = false;

  motivoOptions: string[] = [
    'Cheque Rechazado - Sin Fondos',
    'Cheque Rechazado - Cuenta Embargada',
    'Cheque Rechazado',
    'Irregularidad Cadena de Endosos',
  ];

  protected constructor(public activeModal: NgbActiveModal,
                        protected fb: FormBuilder,
                        protected notasService: NotasService,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService) { }

  ngOnInit() {
    this.createForm();
  }

  getTitle() {
    let title = 'Nueva Nota de Débito ';
    switch (this.notaDebito.tipoComprobante) {
      case TipoDeComprobante.NOTA_DEBITO_A:
        title += '"A"';
        break;
      case TipoDeComprobante.NOTA_DEBITO_B:
        title += '"B"';
        break;
      case TipoDeComprobante.NOTA_DEBITO_C:
        title += '"C"';
        break;
      case TipoDeComprobante.NOTA_DEBITO_X:
        title += '"X"';
        break;
      case TipoDeComprobante.NOTA_DEBITO_Y:
        title += '"Y"';
        break;
      case TipoDeComprobante.NOTA_DEBITO_PRESUPUESTO:
        title += '"P"';
        break;
      default:
        throw new Error('El tipo de comprobante no es una nota de débito.');
        // break;
    }
    return title;
  }

  createForm() {
    const motivo = this.motivoOptions.length ? this.motivoOptions[0] : '';
    this.form = this.fb.group({
      motivo: [motivo , Validators.required],
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
