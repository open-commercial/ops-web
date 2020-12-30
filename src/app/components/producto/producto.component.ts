import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { finalize } from 'rxjs/operators';
import { Producto } from '../../models/producto';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { MedidaService } from '../../services/medida.service';
import { RubrosService } from '../../services/rubros.service';
import { Medida } from '../../models/medida';
import { Rubro } from '../../models/rubro';
import { NgbAccordion, NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';
import { SucursalesService } from '../../services/sucursales.service';
import { Sucursal } from '../../models/sucursal';
import { NuevoProducto } from '../../models/nuevo-producto';
import { HelperService } from '../../services/helper.service';
import Big from 'big.js';
import { CalculosPrecio } from '../../models/calculos-precio';
import { Location } from '@angular/common';
import { CantidadEnSucursal } from '../../models/cantidad-en-sucursal';
import * as moment from 'moment';
import {AuthService} from '../../services/auth.service';
import {Rol} from '../../models/rol';

Big.DP = 15;

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss']
})
export class ProductoComponent implements OnInit {
  title = '';
  medidas: Medida[] = [];
  rubros: Rubro[] = [];
  sucursales: Sucursal[] = [];
  ivas = [0, 10.5, 21];

  allowedRolesToEditCantidades = [ Rol.ADMINISTRADOR ];
  hasRolToEditCantidades = false;

  producto: Producto;
  form: FormGroup;
  submitted = false;

  @ViewChild('accordion', {static: false}) accordion: NgbAccordion;
  imageDataUrl = '';

  // esta variable solo es relevante en la edición
  borrarImagen = false;

  constructor(accordionConfig: NgbAccordionConfig,
              private route: ActivatedRoute,
              private router: Router,
              private medidaService: MedidaService,
              private rubrosService: RubrosService,
              private productosService: ProductosService,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private fb: FormBuilder,
              private sucursalesService: SucursalesService,
              private location: Location,
              private authService: AuthService) {
    accordionConfig.type = 'dark';
  }

  ngOnInit() {
    this.createForm();

    const obvs: Observable<any>[] = [
      this.medidaService.getMedidas(),
      this.rubrosService.getRubros(),
      this.sucursalesService.getSucursales(),
    ];

    if (this.route.snapshot.paramMap.has('id')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      obvs.push(this.productosService.getProducto(id));
    }

    this.loadingOverlayService.activate();
    combineLatest(obvs)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (recursos: [Medida[], Rubro[], Sucursal[], Producto?]) => {
          this.medidas = recursos[0];
          this.rubros = recursos[1];
          this.sucursales = recursos[2];
          if (recursos[3]) {
            this.producto = recursos[3];
            this.title = this.producto.descripcion;
            if (this.producto.urlImagen) {
              this.imageDataUrl = this.producto.urlImagen;
            }
          } else {
            this.title = 'Nuevo Producto';
          }
          this.initializeForm();
        },
        err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.router.navigate(['/productos']);
        }
      )
    ;
  }

  createForm() {
    this.hasRolToEditCantidades = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToEditCantidades);

    this.form = this.fb.group({
      idProducto: null,
      codigo: '',
      descripcion: ['', Validators.required],
      idProveedor: [null, Validators.required],
      idMedida: [null, Validators.required],
      idRubro: [null, Validators.required],
      calculosPrecio: [CalculosPrecio.getEmtpyValues(), Validators.required],
      cantidadEnSucursal: this.fb.array([]),
      bulto: [{ value: 1, disabled: true }, [Validators.required, Validators.min(1)]],
      publico: false,
      fechaVencimiento: null,
      nota: [null, Validators.maxLength(250)],
      imagen: null,
    });
  }

  initializeForm() {
    if (this.hasRolToEditCantidades) {
      this.form.get('bulto').enable();
    }
    if (this.producto) {
      this.form.get('idProducto').setValue(this.producto.idProducto);
      this.form.get('codigo').setValue(this.producto.codigo);
      this.form.get('descripcion').setValue(this.producto.descripcion);
      this.form.get('idProveedor').setValue(this.producto.idProveedor);
      this.form.get('idMedida').setValue(this.producto.idMedida);
      this.form.get('idRubro').setValue(this.producto.idRubro);
      this.form.get('calculosPrecio').setValue(CalculosPrecio.getInstance(this.producto).getValues());
      this.producto.cantidadEnSucursales.forEach(
        ces => this.addCantidadEnSucursal(ces.idSucursal, ces.nombreSucursal, ces.cantidad)
      );
      this.form.get('bulto').setValue(this.producto.bulto);
      this.form.get('publico').setValue(this.producto.publico);

      if (this.producto.fechaVencimiento) {
        const fv = moment(this.producto.fechaVencimiento);
        this.form.get('fechaVencimiento').setValue({ year: fv.year(), month: fv.month() + 1, day: fv.date()});
      }

      this.form.get('nota').setValue(this.producto.nota);
    } else {
      this.sucursales.forEach((s: Sucursal) => this.addCantidadEnSucursal(s.idSucursal, s.nombre));
    }
  }

  get cantidadEnSucursal() {
    return this.form.get('cantidadEnSucursal') as FormArray;
  }

  addCantidadEnSucursal(idSucursal: number, nombreSucursal: string, cantidad: number = 0) {
    this.cantidadEnSucursal.push(this.fb.group({
      idSucursal: [idSucursal, Validators.required],
      nombreSucursal: [nombreSucursal, Validators.required],
      cantidad: [{ value: cantidad, disabled: !this.hasRolToEditCantidades }, [Validators.required, Validators.min(0)]],
    }));
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      if (this.producto) {
        this.submitProductoEditado();
      } else {
        this.submitProductoNuevo();
      }
    }
  }

  submitProductoNuevo() {
    const np = this.getNuevoProductoModel();
    const idMedida = this.form.get('idMedida').value;
    const idRubro = this.form.get('idRubro').value;
    const idProveedor = this.form.get('idProveedor').value;
    this.loadingOverlayService.activate();
    this.productosService.crearProducto(np, idMedida, idRubro, idProveedor)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        () => {
          this.mensajeService.msg('Producto creado correctamente', MensajeModalType.INFO);
          this.location.back();
        },
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      )
    ;
  }

  submitProductoEditado() {
    const p = this.getProductoModel();
    const idMedida = this.form.get('idMedida').value;
    const idRubro = this.form.get('idRubro').value;
    const idProveedor = this.form.get('idProveedor').value;
    this.loadingOverlayService.activate();
    this.productosService.actualizarProducto(p, idMedida, idRubro, idProveedor)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        () => {
          this.mensajeService.msg('Producto actualizado correctamente', MensajeModalType.INFO);
          this.location.back();
        },
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      )
    ;
  }

  /**
   * Para el alta
   */
  getNuevoProductoModel(): NuevoProducto {
    const formValues = this.form.value;

    const auxCes = {};
    if (formValues.cantidadEnSucursal && Array.isArray(formValues.cantidadEnSucursal)) {
      formValues.cantidadEnSucursal.forEach(ces => auxCes[ces.idSucursal] = this.hasRolToEditCantidades ? ces.cantidad : 0);
    }

    return {
      codigo: formValues.codigo,
      descripcion: formValues.descripcion,
      cantidadEnSucursal: auxCes,
      bulto: this.hasRolToEditCantidades ? formValues.bulto : 1,
      precioCosto: formValues.calculosPrecio.precioCosto.toString(),
      gananciaPorcentaje: formValues.calculosPrecio.gananciaPorcentaje.toString(),
      gananciaNeto: formValues.calculosPrecio.gananciaNeto.toString(),
      precioVentaPublico: formValues.calculosPrecio.precioVentaPublico.toString(),
      ivaPorcentaje: formValues.calculosPrecio.ivaPorcentaje.toString(),
      ivaNeto: formValues.calculosPrecio.ivaNeto.toString(),
      oferta: formValues.calculosPrecio.oferta,
      porcentajeBonificacionOferta: formValues.calculosPrecio.porcentajeBonificacionOferta.toString(),
      porcentajeBonificacionPrecio: formValues.calculosPrecio.porcentajeBonificacionPrecio.toString(),
      precioLista: formValues.calculosPrecio.precioLista.toString(),
      publico: formValues.publico,
      nota: formValues.nota,
      fechaVencimiento: HelperService.getDateFromNgbDate(formValues.fechaVencimiento),
      imagen: formValues.imagen,
    };
  }

  /**
   * Para la edicion
   */
  getProductoModel(): Producto {
    const formValues = this.form.value;

    const auxCes: CantidadEnSucursal[] = [];
    if (formValues.cantidadEnSucursal && Array.isArray(formValues.cantidadEnSucursal)) {
      formValues.cantidadEnSucursal.forEach(ces => {
        const aux = this.producto.cantidadEnSucursales.filter((v: CantidadEnSucursal) => v.idSucursal === ces.idSucursal);
        if (aux.length) {
          const nCes = aux[0];
          nCes.cantidad = this.hasRolToEditCantidades ? ces.cantidad : aux[0].cantidad;
          auxCes.push(nCes);
        }
      });
    }

    return {
      idProducto: formValues.idProducto,
      codigo: formValues.codigo,
      descripcion: formValues.descripcion,
      cantidadEnSucursales: auxCes,
      bulto: this.hasRolToEditCantidades ? formValues.bulto : this.producto.bulto,
      publico: formValues.publico,
      precioCosto: formValues.calculosPrecio.precioCosto.toString(),
      gananciaPorcentaje: formValues.calculosPrecio.gananciaPorcentaje.toString(),
      gananciaNeto: formValues.calculosPrecio.gananciaNeto.toString(),
      precioVentaPublico: formValues.calculosPrecio.precioVentaPublico.toString(),
      ivaPorcentaje: formValues.calculosPrecio.ivaPorcentaje.toString(),
      ivaNeto: formValues.calculosPrecio.ivaNeto.toString(),
      precioLista: formValues.calculosPrecio.precioLista.toString(),
      oferta: formValues.calculosPrecio.oferta,
      porcentajeBonificacionOferta: formValues.calculosPrecio.porcentajeBonificacionOferta.toString(),
      porcentajeBonificacionPrecio: formValues.calculosPrecio.porcentajeBonificacionPrecio.toString(),
      nota: formValues.nota,
      fechaVencimiento: HelperService.getDateFromNgbDate(formValues.fechaVencimiento),
      urlImagen: this.borrarImagen && !this.imageDataUrl ? null : this.producto.urlImagen,
      imagen: formValues.imagen,
    };
  }

  panelBeforeChange($event) {
    const activeId = this.accordion.activeIds[0];

    if (this.loadingOverlayService.isActive()) {
      $event.preventDefault();
      return;
    }
    if (this.accordion.activeIds.indexOf($event.panelId) >= 0) {
      $event.preventDefault();
      return;
    }

    if (
      (activeId === 'general' && !this.isGeneralPanelValid()) ||
      (activeId === 'precios' && !this.isPreciosPanelValid()) ||
      (activeId === 'cantidades' && !this.isCantidadesPanelValid()) ||
      (activeId === 'propiedades' && !this.isPropiedadesPanelValid())
    ) {
      this.submitted = true;
      $event.preventDefault();
      return;
    }
  }

  volverAlListado() {
    this.location.back();
  }

  imageChange($event) {
    const file = $event.target.files[0];
    const readerBuffer = new FileReader();
    const readerDataUrl = new FileReader();

    readerBuffer.addEventListener('load', () => {
      this.borrarImagen = false;
      const arr = new Uint8Array(readerBuffer.result as ArrayBuffer);
      this.form.get('imagen').setValue(Array.from(arr));
    });

    readerDataUrl.addEventListener('load', () => {
      this.imageDataUrl = readerDataUrl.result as string;
    });

    readerBuffer.readAsArrayBuffer(file);
    readerDataUrl.readAsDataURL(file);
  }

  clearFile(file) {
    file.value = null;
    this.imageDataUrl = '';
    this.borrarImagen = true;
    this.form.get('imagen').setValue(null);
  }

  isGeneralPanelValid(): boolean {
    return this.form &&
      this.form.get('descripcion').valid &&
      this.form.get('idProveedor').valid &&
      this.form.get('idMedida').valid &&
      this.form.get('idRubro').valid;
  }

  isPreciosPanelValid(): boolean {
    return this.form.get('calculosPrecio').valid;
  }

  isCantidadesPanelValid(): boolean {
    let isValid = this.form.get('cantidadEnSucursal').valid;
    if (this.form.get('bulto').enabled) {
      isValid = isValid && this.form.get('bulto').valid;
    }
    return isValid;
  }

  isPropiedadesPanelValid(): boolean {
    return this.form.get('nota').valid;
  }
}
