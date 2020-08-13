import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Sucursal} from '../../models/sucursal';
import {SucursalesService} from '../../services/sucursales.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {finalize} from 'rxjs/operators';
import {MensajeService} from '../../services/mensaje.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {NuevoTraspaso} from '../../models/nuevo-traspaso';
import {TraspasosService} from '../../services/traspasos.service';
import {Producto} from '../../models/producto';
import {CantidadProductoModalComponent} from '../cantidad-producto-modal/cantidad-producto-modal.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ProductosParaVerificarStock} from '../../models/productos-para-verificar-stock';
import {ProductoFaltante} from '../../models/producto-faltante';
import {ProductosService} from '../../services/productos.service';

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

  cantidadesActualesTraspaso: { [idProducto: number]: number } = {};

  mensajesVerificacion: {[key: number]: string };

  constructor(private router: Router,
              private location: Location,
              private fb: FormBuilder,
              private loadingOverlayService: LoadingOverlayService,
              public sucursalesService: SucursalesService,
              private modalService: NgbModal,
              private mensajeService: MensajeService,
              private productosService: ProductosService,
              private traspasosService: TraspasosService) {
  }

  ngOnInit() {
    this.createForm();
    this.loadingOverlayService.activate();
    this.sucursalesService.getSucursales()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        sucursales => {
          if (sucursales.length < 2) {
            this.mensajeService.msg('Debe existir al menos 2(dos) sucursales', MensajeModalType.ERROR);
            this.volverAlListado();
          }

          this.sucursalesOrigen = sucursales;
          if (this.sucursalesOrigen.length) {
            this.form.get('idSucursalOrigen').setValue(this.sucursalesOrigen[0].idSucursal);
          }
        },
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
      renglones: this.fb.array([], [Validators.required]),
    });

    this.form.get('idSucursalOrigen').valueChanges.subscribe(value => {
      this.form.get('idSucursalDestino').setValue(null);
      this.sucursalesDestino = [];
      if (value) {
        this.sucursalesDestino = this.sucursalesOrigen.filter(s => s.idSucursal !== Number(value));
      }
    });

    this.form.get('renglones').valueChanges.subscribe(value => {
      const aux: { [idProducto: number]: number } = {};
      value.forEach(e => aux[e.producto.idProducto] = e.cantidad);
      this.cantidadesActualesTraspaso = aux;
    });
  }

  get f() {
    return this.form.controls;
  }

  get renglones() {
    return this.form.get('renglones') as FormArray;
  }

  createRenglonTraspasoForm(p: Producto, cantidad: number) {
    const c = this.fb.group({
      producto: [p, Validators.required],
      cantidad: [cantidad, [Validators.required, Validators.min(1)]],
    });

    c.valueChanges.subscribe(v => {
      delete this.mensajesVerificacion[v.producto.idProducto];
    });

    return c;
  }

  addRenglonTraspasoForm(p: Producto, cantidad: number) {
    this.renglones.push(this.createRenglonTraspasoForm(p, cantidad));
  }

  removeRenglonTraspasoForm(i: number) {
    const msg = '¿Desea quitar este producto del traspaso?';
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.renglones.removeAt(i);
      }
    });
  }

  editarCantidad(i: number) {
    const control = this.renglones.at(i);
    const producto = control.get('producto').value;
    this.showCantidadModal(producto, false);
  }

  selectProducto(p: Producto) {
    this.showCantidadModal(p, true);
  }

  directInputSeleccionProducto(p: Producto) {
    const control = this.searchRenglonByIdProducto(p.idProducto);
    const cant = control ? control.get('cantidad').value + 1 : 1;

    const ppvs: ProductosParaVerificarStock = {
      idSucursal: this.form.get('idSucursalOrigen').value,
      idPedido: null,
      idProducto: [p.idProducto],
      cantidad: [cant],
    };

    this.loadingOverlayService.activate();
    this.productosService.getDisponibilidadEnStock(ppvs)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe((pfs: ProductoFaltante[]) => {
        if (!pfs.length) {
          if (control) {
            control.setValue({producto: p, cantidad: cant});
          } else {
            this.addRenglonTraspasoForm(p, cant);
          }
        } else {
          this.mensajeService.msg(
            'No se puede solicitar mas stock para dicho producto. Por favor, verifique la sección Productos.',
            MensajeModalType.ERROR
          );
        }
      })
    ;
  }

  showCantidadModal(p: Producto, addCantidad = false) {
    const control = this.searchRenglonByIdProducto(p.idProducto);
    const cPrevia = control ? control.get('cantidad').value : 0;

    const modalRef = this.modalService.open(CantidadProductoModalComponent);
    modalRef.componentInstance.addCantidad = addCantidad;
    modalRef.componentInstance.cantidadesActualesPedido = this.cantidadesActualesTraspaso;
    modalRef.componentInstance.cantidad = addCantidad ? 1 : cPrevia;
    modalRef.componentInstance.loadProducto(p.idProducto);
    modalRef.componentInstance.verificarStock = true;
    modalRef.componentInstance.idSucursal = Number(this.form.get('idSucursalOrigen').value);

    modalRef.result.then((cantidad: number) => {
      if (control) {
        cantidad = addCantidad ? cPrevia + cantidad : cantidad;
        control.setValue({producto: p, cantidad});
      } else {
        this.addRenglonTraspasoForm(p, cantidad);
      }
    }, () => {
    });
  }

  searchRenglonByIdProducto(idProducto: number): AbstractControl {
    const aux = this.renglones.controls.filter(c => c.get('producto').value.idProducto === idProducto);
    return aux.length ? aux[0] : null;
  }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const nt = this.getNuevoTraspaso();
      this.verificarCantidades(nt, () => {
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
      });
    }
  }

  getNuevoTraspaso(): NuevoTraspaso {
    const formValues = this.form.value;

    const aux = {};
    formValues.renglones.forEach(p => aux[p.producto.idProducto] = p.cantidad);

    return {
      idSucursalOrigen: formValues.idSucursalOrigen ? Number(formValues.idSucursalOrigen) : null,
      idSucursalDestino: formValues.idSucursalDestino ? Number(formValues.idSucursalDestino) : null,
      idProductoConCantidad: aux,
    };
  }

  verificarCantidades(nt: NuevoTraspaso, successCallback: () => void) {
    const ids: number[] = Object.keys(nt.idProductoConCantidad).map(v => Number(v));
    const cants: number[] = Object.values(nt.idProductoConCantidad);

    const ppvs: ProductosParaVerificarStock = {
      idSucursal: this.form.get('idSucursalOrigen').value,
      idPedido: null,
      idProducto: ids,
      cantidad: cants,
    };

    this.mensajesVerificacion = {};
    this.loadingOverlayService.activate();
    this.productosService.getDisponibilidadEnStock(ppvs)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe((pfs: ProductoFaltante[]) => {
        if (pfs.length) {
          const msgFormat = 'La cantidad solicitada del producto (__solicitada__) supera la cantidad disponible (__disponible__).';
          pfs.forEach(pf => this.mensajesVerificacion[pf.idProducto] = msgFormat
            .replace(/__solicitada__/g, pf.cantidadSolicitada.toString())
            .replace(/__disponible__/g, pf.cantidadDisponible.toString())
          );
        } else {
          successCallback();
        }
      })
    ;
  }
}
