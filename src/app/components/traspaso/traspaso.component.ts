import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Sucursal} from '../../models/sucursal';
import {SucursalesService} from '../../services/sucursales.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {finalize} from 'rxjs/operators';
import {MensajeService} from '../../services/mensaje.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {NuevoTraspaso} from '../../models/nuevo-traspaso';
import {TraspasosService} from '../../services/traspasos.service';
import {Producto} from '../../models/producto';

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

  cantidadesInicialesPedido: { [idProducto: number]: number } = {};
  cantidadesActualesPedido: { [idProducto: number]: number } = {};

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
      productos: this.fb.array([], [Validators.required]),
    });

    this.form.get('idSucursalOrigen').valueChanges.subscribe(value => {
      this.form.get('idSucursalDestino').setValue(null);
      this.sucursalesDestino = [];
      if (value) {
        this.sucursalesDestino = this.sucursalesOrigen.filter(s => s.idSucursal !== Number(value));
      }
    });
  }

  get f() { return this.form.controls; }

  get productos() {
    return this.form.get('productos') as FormArray;
  }

  createProductoForm() {
    return this.fb.group({
      producto: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
    });
  }

  addProductoForm() {
    this.productos.push(this.createProductoForm());
  }

  removeProductoForm(i: number) {
    this.productos.removeAt(i);
  }

  editarCantidad(i: number) {
    const pForm = this.productos.at(i);
    console.log(pForm);
  }

  selectProducto(p: Producto) {
    console.log(p);
  }

  directInputSeleccionProducto(p: Producto) {
    console.log(p);
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
    formValues.productos.forEach(p => aux[p.producto.idProducto] = p.cantidad);

    return {
      idSucursalOrigen: formValues.idSucursalOrigen ? Number(formValues.idSucursalOrigen) : null,
      idSucursalDestino: formValues.idSucursalDestino ? Number(formValues.idSucursalDestino) : null,
      idProductoConCantidad: aux,
    };
  }
}
