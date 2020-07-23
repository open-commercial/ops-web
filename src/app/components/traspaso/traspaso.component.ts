import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sucursal } from '../../models/sucursal';
import { SucursalesService } from '../../services/sucursales.service';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { finalize } from 'rxjs/operators';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-traspaso',
  templateUrl: './traspaso.component.html',
  styleUrls: ['./traspaso.component.scss']
})
export class TraspasoComponent implements OnInit {
  loading = false;
  form: FormGroup;
  submitted = false;

  sucursales: Sucursal[] = [];

  constructor(private router: Router,
              private location: Location,
              private fb: FormBuilder,
              private loadingOverlayService: LoadingOverlayService,
              public sucursalesService: SucursalesService,
              private mensajeService: MensajeService) { }

  ngOnInit() {
    this.createForm();
    this.loadingOverlayService.activate();
    this.sucursalesService.getSucursales()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        sucursales => this.sucursales = sucursales,
        err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.volverAlListado();
        }
      )
    ;
  }

  volverAlListado() {
    this.location.back();
  }

  createForm() {
    this.form = this.fb.group({
      idSucursalOrigen: [null, Validators.required],
      idSucursalDestino: [null, Validators.required],
      idProductoConCantidad: this.fb.array([]),
    });
  }

  get f() { return this.form.controls; }

  get idProductoConCantidad() {
    return this.form.get('idProductoConCantidad') as FormArray;
  }

  createIdProductoConCantidadForm() {
    return this.fb.group({
      idProducto: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
    });
  }

  addIdProductoConCantidad() {
    this.idProductoConCantidad.push(this.createIdProductoConCantidadForm());
  }

  submit() {
    this.submitted = true;
  }
}
