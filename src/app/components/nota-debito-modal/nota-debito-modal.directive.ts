import { OnInit, Directive } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {SucursalesService} from '../../services/sucursales.service';
import {NotasService} from '../../services/notas.service';
import {TipoDeComprobante} from '../../models/tipo-de-comprobante';
import {HelperService} from '../../services/helper.service';

@Directive()
export abstract class NotaDebitoModalDirective implements OnInit {
  form: FormGroup;
  submitted = false;
  loading = false;

  title = 'Nueva Nota de Débito';
  tiposDeComprobantes: TipoDeComprobante[] = [];

  helper = HelperService;

  protected constructor(public activeModal: NgbActiveModal,
                        protected fb: FormBuilder,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService,
                        protected sucursalesService: SucursalesService,
                        protected notasService: NotasService) { }

  ngOnInit() {
    this.createForm();
    this.getTiposDeComprobantes();
  }

  createForm() {
    this.form = this.fb.group({
      tipoDeComprobante: [null, Validators.required],
      gastoAdministrativo: [0, Validators.required],
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      this.doSubmit();
    }
  }

  abstract getTiposDeComprobantes();
  abstract doSubmit();
}
