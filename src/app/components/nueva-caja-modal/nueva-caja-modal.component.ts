import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CajasService} from '../../services/cajas.service';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {MensajeService} from '../../services/mensaje.service';

@Component({
  selector: 'app-nueva-caja-modal',
  templateUrl: './nueva-caja-modal.component.html',
  styleUrls: ['./nueva-caja-modal.component.scss']
})
export class NuevaCajaModalComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  loading = false;

  constructor(public activeModal: NgbActiveModal,
              private fb: FormBuilder,
              private cajasService: CajasService,
              private mensajeService: MensajeService) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      saldo: [0 , [Validators.required, Validators.min(0)]]
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const saldoApertura = this.form.get('saldo').value;
      this.loading = true;
      this.cajasService.abrirCaja(saldoApertura)
        .pipe(finalize(() => this.loading = false))
        .subscribe(
          caja => this.activeModal.close(caja),
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
        )
      ;
    }
  }
}
