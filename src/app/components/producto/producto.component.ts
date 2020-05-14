import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { finalize } from 'rxjs/operators';
import { Producto } from '../../models/producto';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss']
})
export class ProductoComponent implements OnInit {
  title = '';
  producto: Producto;
  form: FormGroup;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private productosService: ProductosService,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private fb: FormBuilder) { }

  ngOnInit() {
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

  createForm() {
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      descripcion: ['', Validators.required],
    });
  }

  volverAlListado() {
    this.router.navigate(['/productos']);
  }
}
