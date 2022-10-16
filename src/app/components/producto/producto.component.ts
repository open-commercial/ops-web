import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { finalize } from 'rxjs/operators';
import { Producto } from '../../models/producto';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { MedidasService } from '../../services/medidas.service';
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

  allowedRolesToCreate: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToCreate = false;

  allowedRolesToEdit: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToEdit = false;

  allowedRolesToEditCantidades = [ Rol.ADMINISTRADOR ];
  hasRolToEditCantidades = false;

  producto: Producto;
  form: UntypedFormGroup;
  submitted = false;

  @ViewChild('accordion') accordion: NgbAccordion;
  imageDataUrl = '';

  // esta variable solo es relevante en la edición
  borrarImagen = false;

  constructor(accordionConfig: NgbAccordionConfig,
              private route: ActivatedRoute,
              private router: Router,
              private medidasService: MedidasService,
              private rubrosService: RubrosService,
              private productosService: ProductosService,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private fb: UntypedFormBuilder,
              private sucursalesService: SucursalesService,
              private location: Location,
              private authService: AuthService) {
    accordionConfig.type = 'dark';
  }

  ngOnInit() {
    this.hasRoleToCreate = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCreate);
    this.hasRoleToEdit = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToEdit);

    const obvs: Observable<any>[] = [
      this.medidasService.getMedidas(),
      this.rubrosService.getRubros(),
      this.sucursalesService.getSucursales(),
    ];

    if (this.route.snapshot.paramMap.has('id')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));

      if (!this.hasRoleToEdit) {
        this.mensajeService.msg('No tiene permisos para editar productos.', MensajeModalType.ERROR);
        this.volverAlListado();
        return;
      }

      obvs.push(this.productosService.getProducto(id));
    } else {
      if (!this.hasRoleToCreate) {
        this.mensajeService.msg('No tiene permisos para dar de alta productos.', MensajeModalType.ERROR);
        this.volverAlListado();
        return;
      }
    }

    this.createForm();

    this.loadingOverlayService.activate();
    combineLatest(obvs)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (recursos: [Medida[], Rubro[], Sucursal[], Producto?]) => {
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
        error: err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.router.navigate(['/productos']);
        }
      })
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
      cantMinima: [{ value: 1, disabled: true }, [Validators.required, Validators.min(1)]],
      publico: false,
      paraCatalogo: false,
      fechaVencimiento: null,
      nota: [null, Validators.maxLength(250)],
      imagen: null,
    });
  }

  initializeForm() {
    if (this.hasRolToEditCantidades) {
      this.form.get('cantMinima').enable();
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
      this.form.get('cantMinima').setValue(this.producto.cantMinima);
      this.form.get('publico').setValue(this.producto.publico);
      this.form.get('paraCatalogo').setValue(!!this.producto.paraCatalogo);

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
    return this.form.get('cantidadEnSucursal') as UntypedFormArray;
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
      cantMinima: this.hasRolToEditCantidades ? formValues.cantMinima : 1,
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
      paraCatalogo: formValues.paraCatalogo,
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
      cantMinima: this.hasRolToEditCantidades ? formValues.cantMinima : this.producto.cantMinima,
      publico: formValues.publico,
      paraCatalogo: formValues.paraCatalogo,
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
    }
  }

  volverAlListado() {
    this.location.back();
  }

  imageDataChange(data: number[]) {
    this.borrarImagen = false;
    this.form.get('imagen').setValue(data);
  }

  imageUrlChange(url: string) {
    this.imageDataUrl = url;
    if (!url) { this.borrarImagen = true; }
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
    if (this.form.get('cantMinima').enabled) {
      isValid = isValid && this.form.get('cantMinima').valid;
    }
    return isValid;
  }

  isPropiedadesPanelValid(): boolean {
    return this.form.get('nota').valid;
  }
}
