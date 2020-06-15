import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

  @ViewChild('accordion', {static: false}) accordion: NgbAccordion;
  @ViewChild('imageFileLabel', {static: false}) imageFileLabel: ElementRef;

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
      porcentajeBonificacionOferta: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      precioOferta: [0, [Validators.required, Validators.min(0)]],
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
    console.log('form valid?: ' + this.form.valid);
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
    console.log(formValues);

    return {
      codigo: formValues.codigo,
      descripcion: formValues.descripcion,
      cantidadEnSucursal: { 1: 10, 5: 10 },
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
      imagen: formValues.imagen,
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
    const reader = new FileReader();

    this.imageFileLabel.nativeElement.innerText = file.name;

    reader.addEventListener('load', () => {
      const arr = new Uint8Array(reader.result as ArrayBuffer);
      this.form.get('imagen').setValue(Array.from(arr));
    });

    reader.readAsArrayBuffer(file);
  }
}
