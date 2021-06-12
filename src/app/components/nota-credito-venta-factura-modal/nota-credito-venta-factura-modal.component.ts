import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {NotasService} from '../../services/notas.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {finalize} from 'rxjs/operators';
import {FacturasService} from '../../services/facturas.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {NuevaNotaCreditoDeFactura} from '../../models/nueva-nota-credito-de-factura';

const noneSelected = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const atLeastOneSelected = (control as FormArray).controls.some((rControl) => {
      return rControl.get('checked') && rControl.get('checked').value;
    });

    return atLeastOneSelected ? null : { noneSelected: true };
    /*let cant = 0;
    (control as FormArray).controls.forEach((b) => {
      cant += b.get('cantidad') && b.get('cantidad').valid ? b.get('cantidad').value : 0;
    });
    return cant >= min ? null : { reglonesCount: { count: cant, min }};*/
  };
};

@Component({
  selector: 'app-nota-credito-venta-factura-modal',
  templateUrl: './nota-credito-venta-factura-modal.component.html',
  styleUrls: ['./nota-credito-venta-factura-modal.component.scss']
})
export class NotaCreditoVentaFacturaModalComponent implements OnInit {
  idFactura: number;
  title = '';
  form: FormGroup;
  submitted = false;

  loading = false;

  constructor(public activeModal: NgbActiveModal,
              private fb: FormBuilder,
              private notasService: NotasService,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private facturasService: FacturasService) {}

  ngOnInit() {
    this.createForm();
    this.loading = true;
    this.facturasService.getRenglonesDeFactura(this.idFactura)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        renglones => this.addRenglonesToForm(renglones),
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR).then(() => this.activeModal.dismiss())
      )
    ;
  }

  createForm() {
    this.form = this.fb.group({
      renglones: this.fb.array([], [Validators.required, noneSelected()]),
      modificaStock: true,
    });
  }

  get f() { return this.form.controls; }

  get renglones() {
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

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const formValues = this.form.value;

      const nnc: NuevaNotaCreditoDeFactura = {
        idFactura: this.idFactura,
        idsRenglonesFactura: formValues.renglones.filter(r => r.checked).map(r => r.renglon.idRenglonFactura),
        cantidades: formValues.renglones.filter(r => r.checked).map(r => r.cantidad),
        motivo: '',
        modificaStock: formValues.modificaStock,
      };

      this.loadingOverlayService.activate();
      this.notasService.calcularNotaCreditoDeFactura(nnc)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          nc => this.activeModal.close([nnc, nc]),
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        )
      ;
    }
  }
}
