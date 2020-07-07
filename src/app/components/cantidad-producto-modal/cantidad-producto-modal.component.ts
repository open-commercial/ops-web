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
  stockVerificado = false;
  verificandoDisponibilidadStock = false;
  hayStockDisponible = false;
  stockDisponible = 0;
  idPedido = null;

  addCantidad = false;
  cantidadesInicialesPedido: { [idProducto: number]: number } = {};
  cantidadesActualesPedido: { [idProducto: number]: number } = {};

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
         setTimeout(() => this.cantidadInput.nativeElement.select(), 500);
      })
    ;
  }

  createForm() {
    this.form = this.fb.group({
      cantidad: [this.cantidad, [Validators.required, Validators.min(1)]]
    });
    this.form.get('cantidad').valueChanges.subscribe(() => this.stockVerificado = false);
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const cantidad = this.addCantidad
        ? (this.cantidadesActualesPedido[this.producto.idProducto] || 0) + this.form.value.cantidad
        : this.form.value.cantidad
      ;

      const ppvs: ProductosParaVerificarStock = {
        idSucursal: null,
        idPedido: this.idPedido,
        idProducto: [this.producto.idProducto],
        cantidad: [cantidad],
      };

      if (this.verificarStock) {
        this.verificandoDisponibilidadStock = true;
        this.stockDisponible = 0;
        this.productosService.getDisponibilidadEnStock(ppvs)
          .pipe(finalize(() => this.verificandoDisponibilidadStock = false))
          .subscribe((pfs: ProductoFaltante[]) => {
            const cant = this.form.get('cantidad').value;
            this.stockVerificado = true;
            this.hayStockDisponible = !pfs.length;
            this.stockDisponible = 0;

            const cantInicial = this.cantidadesInicialesPedido[this.producto.idProducto] || 0;
            const cantActual = this.cantidadesActualesPedido[this.producto.idProducto] || 0;

            if (pfs.length) {
              const aux = this.addCantidad
                ? Math.abs(cantActual - cantInicial - pfs[0].cantidadDisponible)
                : (cantInicial) + pfs[0].cantidadDisponible
              ;
              this.stockDisponible = aux > 0 ? aux : 0;
            }

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
