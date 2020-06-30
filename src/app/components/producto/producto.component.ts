import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { finalize } from 'rxjs/operators';
import { Producto } from '../../models/producto';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest } from 'rxjs';
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
import { formatNumber } from '@angular/common';

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

  producto: Producto;
  form: FormGroup;
  submitted = false;

  calculosPrecio = new CalculosPrecio();

  @ViewChild('accordion', {static: false}) accordion: NgbAccordion;
  imageDataUrl = '';

  constructor(accordionConfig: NgbAccordionConfig,
              private route: ActivatedRoute,
              private router: Router,
              private medidaService: MedidaService,
              private rubrosService: RubrosService,
              private productosService: ProductosService,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private fb: FormBuilder,
              private sucursalesService: SucursalesService) {
    accordionConfig.type = 'dark';
  }

  ngOnInit() {
    this.createForm();
    this.getRecursosRelacionados();

    if (this.route.snapshot.paramMap.has('id')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loadingOverlayService.activate();
      this.productosService.getProducto(id)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          (p: Producto) => {
            this.producto = p;
            this.title = 'Producto ' + this.producto.codigo;
          },
          err => {
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            this.volverAlListado();
          }
        )
      ;
    } else {
      this.title = 'Nuevo Producto';
    }
  }

  getRecursosRelacionados() {
    const obvs = [
      this.medidaService.getMedidas(),
      this.rubrosService.getRubros(),
      this.sucursalesService.getSucursales(),
    ];
    this.loadingOverlayService.activate();
    combineLatest(obvs)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe((recursos: [Medida[], Rubro[], Sucursal[]]) => {
        this.medidas = recursos[0];
        this.rubros = recursos[1];
        this.sucursales = recursos[2];
        this.agregarCantidadesDeSucursal();
      })
    ;
  }

  createForm() {
    this.form = this.fb.group({
      codigo: '',
      descripcion: ['', Validators.required],
      idProveedor: [null, Validators.required],
      idMedida: [null, Validators.required],
      idRubro: [null, Validators.required],
      precioCosto: [0, [Validators.required, Validators.min(0)]],
      gananciaPorcentaje: [0, [Validators.required, Validators.min(0)]],
      precioVentaPublico: [0, [Validators.required, Validators.min(0)]],
      ivaPorcentaje: [0, Validators.required],
      precioLista: [0, [Validators.required, Validators.min(0)]],
      porcentajeBonificacionPrecio: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      precioBonificado: [0, [Validators.required, Validators.min(0)]],
      oferta: false,
      porcentajeBonificacionOferta: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0), Validators.max(100)]],
      precioOferta: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      cantidadEnSucursal: this.fb.array([]),
      bulto: [1, [Validators.required, Validators.min(1)]],
      publico: false,
      fechaVencimiento: null,
      estanteria: null,
      estante: null,
      nota: null,
      imagen: null,
    });

    // this.form.valueChanges.subscribe((value) => console.log(value));
  }

  get cantidadEnSucursal() {
    return this.form.get('cantidadEnSucursal') as FormArray;
  }

  addCantidadEnSucursal(sucursal: Sucursal, cantidad: number = 0) {
    this.cantidadEnSucursal.push(this.fb.group({
      sucursal: [sucursal, Validators.required],
      cantidad: [cantidad, [Validators.required, Validators.min(0)]],
    }));
  }

  agregarCantidadesDeSucursal() {
    this.sucursales.forEach((s: Sucursal) => this.addCantidadEnSucursal(s));
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      // submits the form
      this.submitProductoNuevo();
    }
  }

  submitProductoNuevo() {
    const np = this.getProductoModel();
    const idMedida = this.form.get('idMedida').value;
    const idRubro = this.form.get('idRubro').value;
    const idProveedor = this.form.get('idProveedor').value;
    this.loadingOverlayService.activate();
    this.productosService.crearProducto(np, idMedida, idRubro, idProveedor)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(() => {
        console.log('guardado correctamente.');
      })
    ;
  }

  getProductoModel(): NuevoProducto {
    const formValues = this.form.value;

    const auxCes = {};
    if (formValues.cantidadEnSucursal && Array.isArray(formValues.cantidadEnSucursal)) {
      formValues.cantidadEnSucursal.forEach(ces => auxCes[ces.sucursal.idSucursal] = ces.cantidad);
    }

    return {
      imagen: formValues.imagen,
      codigo: formValues.codigo,
      descripcion: formValues.descripcion,
      // cantidadEnSucursal: { 1: 10, 5: 10 },
      cantidadEnSucursal: auxCes,
      hayStock: true,
      cantMinima: 0,
      bulto: formValues.bulto,
      precioCosto: formValues.precioCosto,
      gananciaPorcentaje: formValues.gananciaPorcentaje,
      gananciaNeto: 0,
      precioVentaPublico: formValues.precioVentaPublico,
      ivaPorcentaje: formValues.ivaPorcentaje,
      ivaNeto: 0,
      oferta: formValues.oferta,
      porcentajeBonificacionOferta: formValues.porcentajeBonificacionOferta,
      porcentajeBonificacionPrecio: formValues.porcentajeBonificacionPrecio,
      precioBonificado: formValues.precioBonificado,
      precioLista: formValues.precioLista,
      ilimitado: false,
      publico: formValues.publico,
      fechaUltimaModificacion: null,
      estanteria: formValues.estanteria,
      estante: formValues.estante,
      nota: formValues.nota,
      fechaVencimiento: HelperService.getDateFromNgbDate(formValues.fechaVencimiento),
    };
  }

  panelBeforeChange($event) {
    if (this.loadingOverlayService.isActive()) {
      $event.preventDefault();
      return;
    }
    if (this.accordion.activeIds.indexOf($event.panelId) >= 0) {
      $event.preventDefault();
    }
  }

  volverAlListado() {
    this.router.navigate(['/productos']);
  }

  imageChange($event) {
    const file = $event.target.files[0];
    const readerBuffer = new FileReader();
    const readerDataUrl = new FileReader();

    readerBuffer.addEventListener('load', () => {
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
    file.value = '';
    this.imageDataUrl = '';
    this.form.get('imagen').setValue(null);
  }

  refreshPreciosEnFormulario() {
    this.form.get('precioCosto').setValue(this.formatBigForDisplay(this.calculosPrecio.precioCosto));
    this.form.get('gananciaPorcentaje').setValue(this.formatBigForDisplay(this.calculosPrecio.gananciaPorcentaje));
    this.form.get('precioVentaPublico').setValue(this.formatBigForDisplay(this.calculosPrecio.precioVentaPublico));
    this.form.get('precioLista').setValue(this.formatBigForDisplay(this.calculosPrecio.precioLista));
    this.form.get('porcentajeBonificacionPrecio').setValue(this.formatBigForDisplay(this.calculosPrecio.porcentajeBonificacionPrecio));
    this.form.get('precioBonificado').setValue(this.formatBigForDisplay(this.calculosPrecio.precioBonificado));

    const oferta = this.form.get('oferta').value;
    this.form.get('porcentajeBonificacionOferta').setValue(
      oferta ? this.formatBigForDisplay(this.calculosPrecio.porcentajeBonificacionOferta) : (new Big(0)).toFixed()
    );
    this.form.get('precioOferta').setValue(
      oferta ? this.formatBigForDisplay(this.calculosPrecio.precioOferta) : (new Big(0)).toFixed()
    );
  }

  formatBigForDisplay(n: Big) {
    return formatNumber(parseFloat(n.toFixed(2)), 'en-US', '1.0-2');
  }

  precioCostoChange($event) {
    const v = $event.target.value;
    const pc = parseFloat(v);
    this.calculosPrecio.precioCosto = isNaN(pc) ? new Big(0) : new Big(v);
    this.refreshPreciosEnFormulario();
  }

  gananciaPorcentajeChange($event) {
    const v = $event.target.value;
    const gp = parseFloat(v);
    this.calculosPrecio.gananciaPorcentaje = isNaN(gp) ? new Big(0) : new Big(v);
    this.refreshPreciosEnFormulario();
  }

  precioVentaPublicoChange($event) {
    const v = $event.target.value;
    const pvp = parseFloat(v);
    this.calculosPrecio.precioVentaPublico = isNaN(pvp) ? new Big(0) : new Big(v);
    this.refreshPreciosEnFormulario();
  }

  ivaPorcentajeChange($event) {
    const v = $event.target.value;
    const ip = parseFloat(v);
    this.calculosPrecio.ivaPorcentaje = isNaN(ip) ? new Big(0) : new Big(ip);
    this.refreshPreciosEnFormulario();
  }

  precioListaChange($event) {
    const v = $event.target.value;
    const pl = parseFloat(v);
    this.calculosPrecio.precioLista = isNaN(pl) ? new Big(0) : new Big(pl);
    this.refreshPreciosEnFormulario();
  }

  porcentajeBonificacionPrecioChange($event) {
    const v = $event.target.value;
    const pbp = parseFloat(v);
    this.calculosPrecio.porcentajeBonificacionPrecio = isNaN(pbp) ? new Big(0) : new Big(pbp);
    this.refreshPreciosEnFormulario();
  }

  precioBonificadoChange($event) {
    const v = $event.target.value;
    const pb = parseFloat(v);
    // this.calculosPrecio.precioBonificado = isNaN(pb) ? new Big(0) : new Big(pb);
    const name = 'precioBonificado';
    this.calculosPrecio[name] = isNaN(pb) ? new Big(0) : new Big(pb);
    this.refreshPreciosEnFormulario();
  }

  ofertaChange() {
    const oferta = this.form.get('oferta').value;
    if (oferta) {
      this.form.get('porcentajeBonificacionOferta').enable();
      this.form.get('precioOferta').enable();
    } else {
      this.form.get('porcentajeBonificacionOferta').disable();
      this.form.get('precioOferta').disable();
    }
  }
}
