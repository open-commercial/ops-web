import {Directive, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NotasService} from '../../services/notas.service';
import {SucursalesService} from '../../services/sucursales.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {HelperService} from '../../services/helper.service';
import {TipoDeComprobante} from '../../models/tipo-de-comprobante';
import {NuevaNotaCreditoSinFactura} from '../../models/nueva-nota-credito-sin-factura';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';

@Directive()
export abstract class NotaCreditoSinFacturaModalDirective implements OnInit {
  form: FormGroup;
  submitted = false;
  loading = false;
  tiposDeComprobantes: TipoDeComprobante[] = [];

  helper = HelperService;

  protected constructor(public activeModal: NgbActiveModal,
                        protected fb: FormBuilder,
                        public loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService,
                        protected sucursalesService: SucursalesService,
                        protected notasService: NotasService) { }

  ngOnInit() {
    this.createForm();
    this.getTiposDeComprobante();
  }

  createForm() {
    this.form = this.fb.group({
      tipoDeComprobante: [null, Validators.required],
      descripcion: ['', Validators.required],
      monto: [0, [Validators.required, Validators.min(0.1)]],
    });
  }

  get f() { return this.form.controls; }

  abstract getTiposDeComprobante();
  abstract getNuevaNotaCreditoSinFactura(): NuevaNotaCreditoSinFactura;

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const nnc: NuevaNotaCreditoSinFactura = this.getNuevaNotaCreditoSinFactura();
      this.loadingOverlayService.activate();
      this.notasService.calcularNotaCreditoSinFactura(nnc)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: nc => this.activeModal.close([nnc, nc]),
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }
}
