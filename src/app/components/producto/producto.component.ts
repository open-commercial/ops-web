import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { finalize } from 'rxjs/operators';
import { Producto } from '../../models/producto';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { MedidaService } from '../../services/medida.service';
import { RubrosService } from '../../services/rubros.service';
import { Medida } from '../../models/medida';
import { Rubro } from '../../models/rubro';
import { NgbAccordion, NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss']
})
export class ProductoComponent implements OnInit {
  title = '';
  medidas: Medida[] = [];
  rubros: Rubro[] = [];

  producto: Producto;
  form: FormGroup;
  submitted = false;

  @ViewChild('accordion', {static: false}) accordion: NgbAccordion;

  constructor(accordionConfig: NgbAccordionConfig,
              private route: ActivatedRoute,
              private router: Router,
              private medidaService: MedidaService,
              private rubrosService: RubrosService,
              private productosService: ProductosService,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private fb: FormBuilder) {
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
    ];
    this.loadingOverlayService.activate();
    combineLatest(obvs)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe((recursos: [Medida[], Rubro[]]) => {
        this.medidas = recursos[0];
        this.rubros = recursos[1];
      })
    ;
  }

  createForm() {
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      descripcion: ['', Validators.required],
      idProveedor: [null, Validators.required],
      idMedida: [null, Validators.required],
      idRubro: [null, Validators.required],
      precioCosto: [0, [Validators.required, Validators.min(1)]],
      gananciaPorcentaje: [0, [Validators.required, Validators.min(10)]]
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      // submits the form
    }
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
}
