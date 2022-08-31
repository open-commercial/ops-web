import { Component, OnInit } from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {NuevoRenglonFactura} from '../../models/nuevo-renglon-factura';

@Component({
  selector: 'app-nuevo-renglon-factura-modal',
  templateUrl: './nuevo-renglon-factura-modal.component.html'
})
export class NuevoRenglonFacturaModalComponent implements OnInit {
  form: UntypedFormGroup;
  submitted = false;
  nrf: NuevoRenglonFactura;

  constructor(private fb: UntypedFormBuilder,
              public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      idProducto: [(this.nrf && this.nrf.idProducto ? this.nrf.idProducto : null), Validators.required],
      cantidad: [(this.nrf && this.nrf.cantidad ? this.nrf.cantidad : 1), [Validators.required, Validators.min(1)]],
      bonificacion: [(this.nrf && this.nrf.bonificacion ? this.nrf.bonificacion : 0), Validators.min(0)],
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const formValues = this.form.value;
      const nrf: NuevoRenglonFactura = {
        idProducto: formValues.idProducto,
        cantidad: formValues.cantidad,
        bonificacion: formValues.bonificacion || 0,
      };
      this.activeModal.close(nrf);
    }
  }
}
