import {Directive, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {NotasService} from '../services/notas.service';
import {LoadingOverlayService} from '../services/loading-overlay.service';
import {MensajeService} from '../services/mensaje.service';
import {FacturasService} from '../services/facturas.service';
import {NuevaNotaCreditoDeFactura} from '../models/nueva-nota-credito-de-factura';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../components/mensaje-modal/mensaje-modal.component';

const noneSelected = (): ValidatorFn => {
  return (control: FormArray): ValidationErrors | null => {
    const atLeastOneSelected = control.controls.some((rControl) => {
      return rControl.get('checked') && rControl.get('checked').value;
    });

    return atLeastOneSelected ? null : { noneSelected: true };
  };
};

@Directive()
export abstract class NotaCreditoFacturaModalDirective implements OnInit {
  idFactura: number;
  title = '';
  form: FormGroup;
  submitted = false;

  loading = false;

  protected constructor(public activeModal: NgbActiveModal,
                        protected fb: FormBuilder,
                        protected notasService: NotasService,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService,
                        protected facturasService: FacturasService) {}

  ngOnInit() {
    this.createForm();
    this.getRenglonesDeFactura();
  }

  getRenglonesDeFactura() {
    this.loading = true;
    this.facturasService.getRenglonesDeFactura(this.idFactura)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: renglones => this.addRenglonesToForm(renglones),
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR).then(() => this.activeModal.dismiss())
      })
    ;
  }

  createForm() {
    this.form = this.fb.group({
      renglones: this.fb.array([], [Validators.required, noneSelected()]),
      modificaStock: true,
    });
  }

  get f() { return this.form.controls; }

  get renglones(): FormArray {
    return this.form.get('renglones') as FormArray;
  }

  addRenglonesToForm(renglones) {
    renglones.forEach(r => {
      const rControl = this.fb.group({
        checked: false,
        renglon: r,
        cantidad: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0.1), Validators.max(r.cantidad)]]
      });
      rControl.get('checked').valueChanges.subscribe(value => {
        if (value) { rControl.get('cantidad').enable(); } else { rControl.get('cantidad'). disable(); }
      });
      this.renglones.push(rControl);
    });
  }

  seleccionarTodo() {
    this.renglones.controls.forEach((c: FormGroup) => {
      const r = c.get('renglon').value;
      c.get('checked').setValue(true);
      c.get('cantidad').setValue(r.cantidad);
    });
  }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const nnc = this.getNuevaNotaDeCreditoDeFactura();

      this.loadingOverlayService.activate();
      this.notasService.calcularNotaCreditoDeFactura(nnc)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: nc => this.activeModal.close([nnc, nc]),
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }

  getNuevaNotaDeCreditoDeFactura(): NuevaNotaCreditoDeFactura {
    const formValues = this.form.value;
    return {
      idFactura: this.idFactura,
      idsRenglonesFactura: formValues.renglones.filter(r => r.checked).map(r => r.renglon.idRenglonFactura),
      cantidades: formValues.renglones.filter(r => r.checked).map(r => r.cantidad),
      motivo: '',
      modificaStock: formValues.modificaStock,
    };
  }
}
