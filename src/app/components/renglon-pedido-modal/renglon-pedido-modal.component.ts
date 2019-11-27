import { Component, ElementRef, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RenglonPedido } from '../../models/renglon-pedido';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Producto } from '../../models/producto';
import { PedidosService } from '../../services/pedidos.service';
import { NuevoRenglonPedido } from '../../models/nuevo-renglon-pedido';
import { finalize } from 'rxjs/operators';
import { Cliente } from '../../models/cliente';
import { ProductosService } from '../../services/productos.service';

@Component({
  selector: 'app-renglon-pedido-modal',
  templateUrl: './renglon-pedido-modal.component.html',
  styleUrls: ['./renglon-pedido-modal.component.scss']
})
export class RenglonPedidoModalComponent implements OnInit, AfterViewInit {
  cliente: Cliente;
  cantidad = 1;
  producto: Producto = null;
  productoLoading = false;
  form: FormGroup;
  submitted = false;
  loading = false;

  @ViewChild('cantidadInput', { static: false }) cantidadInput: ElementRef;

  constructor(private fb: FormBuilder,
              public activeModal: NgbActiveModal,
              private pedidosService: PedidosService,
              private productosService: ProductosService) { }

  ngOnInit() {
    this.createForm();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.cantidadInput.nativeElement.focus(), 200);
  }

  public loadProducto(idProductoItem: number) {
    this.productoLoading = true;
    this.productosService.getProducto(idProductoItem)
      .pipe(finalize(() => this.productoLoading = false))
      .subscribe((p: Producto) => {
         this.producto = p;
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
      const cant = this.form.value.cantidad;
      const nrp: NuevoRenglonPedido = {
        idProductoItem: this.producto.idProducto,
        cantidad: cant,
      };

      this.loading = true;
      this.pedidosService.calcularRenglones([nrp], this.cliente.idCliente)
        .pipe(finalize(() => this.loading = false))
        .subscribe(data =>  {
          const rp: RenglonPedido = data[0];
          this.activeModal.close(rp);
        });
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
