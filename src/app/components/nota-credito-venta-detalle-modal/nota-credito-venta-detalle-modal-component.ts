import {NotaCredito} from '../../models/nota';
import {Cliente} from '../../models/cliente';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {NotasService} from '../../services/notas.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import { OnInit, Directive } from '@angular/core';
import {TipoDeComprobante} from '../../models/tipo-de-comprobante';
import {ClientesService} from '../../services/clientes.service';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';

@Directive()
export default abstract class NotaCreditoVentaDetalleModalComponent implements OnInit {
  notaCredito: NotaCredito;
  idCliente: number;
  cliente: Cliente;
  form: FormGroup;
  submitted = false;
  loading = false;

  protected constructor(public activeModal: NgbActiveModal,
                        protected fb: FormBuilder,
                        protected notasService: NotasService,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService,
                        protected clientesService: ClientesService) {}
  ngOnInit() {
    this.createForm();
    if (!this.cliente && this.idCliente) {
      this.loadingOverlayService.activate();
      this.clientesService.getCliente(this.idCliente)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          (c: Cliente) => this.cliente = c,
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        )
      ;
    }
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
