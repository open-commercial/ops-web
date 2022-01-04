import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormaDePago} from '../../models/forma-de-pago';
import {MensajeService} from '../../services/mensaje.service';
import {FormasDePagoService} from '../../services/formas-de-pago.service';
import {SucursalesService} from '../../services/sucursales.service';
import {GastosService} from '../../services/gastos.service';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {NuevoGasto} from '../../models/nuevo-gasto';
import {Gasto} from '../../models/gasto';

@Component({
  selector: 'app-gasto-form',
  templateUrl: './gasto-form.component.html'
})
export class GastoFormComponent implements OnInit {
  loading = false;
  form: FormGroup;
  submitted = false;
  formasDePago: FormaDePago[] = [];

  @Output() gastoSaved = new EventEmitter<Gasto>();

  constructor(private fb: FormBuilder,
              private mensajeService: MensajeService,
              private formasDePagoService: FormasDePagoService,
              private sucursalesService: SucursalesService,
              private gastosService: GastosService) { }

  ngOnInit() {
    this.createForm();
    this.loading = true;
    this.formasDePagoService.getFormasDePago()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: formasDePago => this.formasDePago = formasDePago,
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

  createForm() {
    this.form = this.fb.group({
      idFormaDePago: [null, Validators.required],
      concepto: ['', Validators.required],
      monto: [0, [Validators.required, Validators.min(0)]],
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const formValues = this.form.value;
      const nuevoGasto: NuevoGasto = {
        idSucursal: this.sucursalesService.getIdSucursal(),
        idFormaDePago: formValues.idFormaDePago,
        concepto: formValues.concepto,
        monto: formValues.monto,
      };

      this.loading = true;
      this.gastosService.crearGasto(nuevoGasto)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: gasto => this.gastoSaved.emit(gasto),
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }
}
