import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup, ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Sucursal } from '../../models/sucursal';
import { SucursalesService } from '../../services/sucursales.service';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { finalize } from 'rxjs/operators';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { NuevoTraspaso } from '../../models/nuevo-traspaso';
import { TraspasosService } from '../../services/traspasos.service';
import { Producto } from '../../models/producto';
import { CantidadEnSucursal } from '../../models/cantidad-en-sucursal';
import { ProductoFiltroComponent } from '../producto-filtro/producto-filtro.component';

function nonUniqueIdProductoValidator(): ValidatorFn {
  return (control: FormArray): {[key: string]: any} | null => {
    const aux: { [key: number]: number } = {};
    control.controls.forEach(c => {
      if (c.value.idProducto) {
        aux[c.value.idProducto] = aux[c.value.idProducto] ? aux[c.value.idProducto] + 1 : 1;
      }
    });
    const duplicates = [];
    for (const k in aux) {
      if (aux.hasOwnProperty(k) && aux[k] > 1) { duplicates.push(k); }
    }
    return duplicates.length ? { nonUniqueIdProducto : duplicates } : null;
  };
}

@Component({
  selector: 'app-traspaso',
  templateUrl: './traspaso.component.html',
  styleUrls: ['./traspaso.component.scss']
})
export class TraspasoComponent implements OnInit {
  loading = false;
  form: FormGroup;
  submitted = false;

  sucursalesOrigen: Sucursal[] = [];
  sucursalesDestino: Sucursal[] = [];

  constructor(private router: Router,
              private location: Location,
              private fb: FormBuilder,
              private loadingOverlayService: LoadingOverlayService,
              public sucursalesService: SucursalesService,
              private mensajeService: MensajeService,
              private traspasosService: TraspasosService) { }

  ngOnInit() {
    this.createForm();
    this.loadingOverlayService.activate();
    this.sucursalesService.getSucursales()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        sucursales => this.sucursalesOrigen = sucursales,
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
      idProductoConCantidad: this.fb.array([], [Validators.required, nonUniqueIdProductoValidator()]),
    });

    this.form.get('idSucursalOrigen').valueChanges.subscribe(value => {
      this.form.get('idSucursalDestino').setValue(null);
      this.sucursalesDestino = [];
      if (value) {
        const aux = this.sucursalesOrigen.filter(s => s.idSucursal !== Number(value));
        this.sucursalesDestino = aux;
      }
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

  removeIdProductoConCantidad(i: number) {
    this.idProductoConCantidad.removeAt(i);
  }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const nt = this.getNuevoTraspaso();

      this.loadingOverlayService.activate();
      this.traspasosService.guardarTraspaso(nt)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          () => {
            this.mensajeService.msg('Traspaso creado correctamente.', MensajeModalType.INFO);
            this.volverAlListado();
          },
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
        )
      ;
    }
  }

  getNuevoTraspaso(): NuevoTraspaso {
    const formValues = this.form.value;

    const aux = {};
    formValues.idProductoConCantidad.forEach(pc => aux[pc.idProducto] = pc.cantidad);

    return {
      idSucursalOrigen: formValues.idSucursalOrigen ? Number(formValues.idSucursalOrigen) : null,
      idSucursalDestino: formValues.idSucursalDestino ? Number(formValues.idSucursalDestino) : null,
      idProductoConCantidad: aux,
    };
  }

  /*productoOCantidadChange(productoElementRef: ProductoFiltroComponent, pc: AbstractControl) {
    const p = productoElementRef.producto;
    const idSucursalOrigen = this.form.get('idSucursalOrigen').value;
    const cantControl = pc.get('cantidad');

    if (cantControl.errors && cantControl.errors.insuficiente) {
      delete cantControl.errors.insuficiente;
    }

    if (idSucursalOrigen && p) {
      const aux = p.cantidadEnSucursales.filter(ces => ces.idSucursal === Number(idSucursalOrigen));
      const cantEnSucursal = aux.length ? aux[0].cantidad : 0;
      const cantATraspasar = cantControl.value && cantControl.value > 0 ? cantControl.value : 0;

      if (cantEnSucursal < cantATraspasar) {
        cantControl.setErrors({ insuficiente: { cantATraspasar, cantEnSucursal }});
      }
    }
  }*/
}
