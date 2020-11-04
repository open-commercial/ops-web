import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormasDePagoService} from '../../services/formas-de-pago.service';
import {FormaDePago} from '../../models/forma-de-pago';
import {finalize} from 'rxjs/operators';
import {MensajeService} from '../../services/mensaje.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {GastosService} from '../../services/gastos.service';
import {NuevoGasto} from '../../models/nuevo-gasto';
import {SucursalesService} from '../../services/sucursales.service';

@Component({
  selector: 'app-nuevo-gasto-modal',
  templateUrl: './nuevo-gasto-modal.component.html',
  styleUrls: ['./nuevo-gasto-modal.component.scss']
})
export class NuevoGastoModalComponent implements OnInit {
  loading = false;
  form: FormGroup;
  submitted = false;
  formasDePago: FormaDePago[] = [];

  constructor(public activeModal: NgbActiveModal,
              private fb: FormBuilder,
              private mensajeService: MensajeService,
              private formasDePagoService: FormasDePagoService,
              private sucursalesService: SucursalesService,
              private gastosService: GastosService) { }

  ngOnInit() {
    this.createForm();
    this.loading = true;
    this.formasDePagoService.getFormasDePago()
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        formasDePago => this.formasDePago = formasDePago,
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      )
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
        .subscribe(
          () => this.activeModal.close(),
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        )
      ;
    }
  }
}
