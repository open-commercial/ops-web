import {Directive, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {LoadingOverlayService} from '../services/loading-overlay.service';
import {MensajeService} from '../services/mensaje.service';
import {FormaDePago} from '../models/forma-de-pago';
import {FormasDePagoService} from '../services/formas-de-pago.service';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../components/mensaje-modal/mensaje-modal.component';
import {Observable} from 'rxjs';
import {Recibo} from '../models/recibo';
import {Rol} from '../models/rol';
import {AuthService} from '../services/auth.service';

@Directive()
export abstract class ReciboModalDirective implements OnInit {
  form: FormGroup;
  saldo = 0;
  formasDePago: FormaDePago[] = [];
  submitted = false;
  loading = false;

  allowedRolesToCrearRecibo: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToCrearRecibo = false;

  protected constructor(public activeModal: NgbActiveModal,
                        protected fb: FormBuilder,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService,
                        protected formasDePagoService: FormasDePagoService,
                        protected authService: AuthService) { }

  ngOnInit() {
    this.createForm();
    this.hasRoleToCrearRecibo = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCrearRecibo);
    if (!this.hasRoleToCrearRecibo) {
      this.activeModal.dismiss();
      this.mensajeService.msg('No tiene permisos para crear recibos.');
      return;
    }
    this.getFormasDePago();
  }

  getTitle(): string {
    return 'Nuevo Recibo';
  }

  getFormasDePago() {
    this.loading = true;
    this.formasDePagoService.getFormasDePago()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: data => this.formasDePago = data,
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR).then(() => this.activeModal.dismiss()),
      })
    ;
  }

  createForm() {
    this.form = this.fb.group({
      idFormaDePago: [null, Validators.required],
      monto: [this.saldo, [Validators.required, Validators.min(1)]],
      concepto: ['SALDO' , Validators.required],
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const r = this.getReciboObject();
      const submitObservable = this.getSubmitObservable(r);
      this.loadingOverlayService.activate();
      submitObservable
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: recibo => {
            this.mensajeService.msg('El recibo fue creado correctamente.', MensajeModalType.INFO);
            this.activeModal.close(recibo);
          },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }

  abstract getReciboObject(): Recibo;
  abstract getSubmitObservable(recibo: Recibo): Observable<Recibo>;
}
