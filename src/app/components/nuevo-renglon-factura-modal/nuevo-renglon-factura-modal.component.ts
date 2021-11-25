import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {NuevoRenglonFactura} from '../../models/nuevo-renglon-factura';

@Component({
  selector: 'app-nuevo-renglon-factura-modal',
  templateUrl: './nuevo-renglon-factura-modal.component.html',
  styleUrls: ['./nuevo-renglon-factura-modal.component.scss']
})
export class NuevoRenglonFacturaModalComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  constructor(private fb: FormBuilder,
              public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      idProducto: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      bonificacion: [0, Validators.min(0)],
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
