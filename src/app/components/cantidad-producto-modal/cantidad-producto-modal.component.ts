import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Producto } from '../../models/producto';
import { finalize } from 'rxjs/operators';
import { ProductosService } from '../../services/productos.service';
import { ProductosParaVerificarStock } from '../../models/productos-para-verificar-stock';
import { ProductoFaltante } from '../../models/producto-faltante';

@Component({
  selector: 'app-cantidad-producto-modal',
  templateUrl: './cantidad-producto-modal.component.html',
  styleUrls: ['./cantidad-producto-modal.component.scss']
})
export class CantidadProductoModalComponent implements OnInit {
  idProducto = null;
  cantidad = 1;
  producto: Producto = null;
  productoLoading = false;
  form: FormGroup;
  submitted = false;
  loading = false;
  verificarStock = false;
  verificandoDisponibilidadStock = false;
  hayStockDisponible = false;
  stockDisponible = 0;
  idPedido = null;

  @ViewChild('cantidadInput', { static: false }) cantidadInput: ElementRef;

  constructor(private fb: FormBuilder,
              public activeModal: NgbActiveModal,
              private productosService: ProductosService) { }

  ngOnInit() {
    this.createForm();
  }

  public loadProducto(idProductoItem: number) {
    this.productoLoading = true;
    this.productosService.getProducto(idProductoItem)
      .pipe(finalize(() => this.productoLoading = false))
      .subscribe((p: Producto) => {
         this.producto = p;
         setTimeout(() => this.cantidadInput.nativeElement.focus(), 500);
      })
    ;
  }

  createForm() {
    this.form = this.fb.group({
      cantidad: [this.cantidad, [Validators.required, Validators.min(1)]]
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const ppvs: ProductosParaVerificarStock = {
        idSucursal: null,
        idPedido: this.idPedido,
        idProducto: [this.producto.idProducto],
        cantidad: [this.form.value.cantidad],
      };

      if (this.verificarStock) {
        this.verificandoDisponibilidadStock = true;
        this.stockDisponible = 0;
        this.productosService.getDisponibilidadEnStock(ppvs)
          .pipe(finalize(() => this.verificandoDisponibilidadStock = false))
          .subscribe((pfs: ProductoFaltante[]) => {
            const cant = this.form.get('cantidad').value;
            this.hayStockDisponible = !pfs.length;
            this.stockDisponible = pfs.length ? pfs[0].cantidadDisponible : 0;
            if (!pfs.length) {
              this.activeModal.close(cant);
            }
          })
        ;
      } else {
        this.activeModal.close(this.form.get('cantidad').value);
      }
    }
  }

  incrementarCantidad() {
    let cant = parseInt(this.form.get('cantidad').value, 10);
    if (!isNaN(cant)) {
      cant += 1;
      this.form.get('cantidad').setValue(cant);
    }
  }

  decrementarCantidad() {
    let cant = parseInt(this.form.get('cantidad').value, 10);
    if (!isNaN(cant) && cant > 1) {
      cant -= 1;
      this.form.get('cantidad').setValue(cant);
    }
  }
}
