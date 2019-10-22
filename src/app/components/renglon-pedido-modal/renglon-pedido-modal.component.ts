import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RenglonPedido } from '../../models/renglon-pedido';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Producto } from '../../models/producto';
import { PedidosService } from '../../services/pedidos.service';
import { NuevoRenglonPedido } from '../../models/nuevo-renglon-pedido';
import { finalize } from 'rxjs/operators';
import { Cliente } from '../../models/cliente';

@Component({
  selector: 'app-renglon-pedido-modal',
  templateUrl: './renglon-pedido-modal.component.html',
  styleUrls: ['./renglon-pedido-modal.component.scss']
})
export class RenglonPedidoModalComponent implements OnInit {
  cliente: Cliente;
  idProductoItem: number;
  cantidad = 1;
  codigoItem: string;
  descripcionItem: string;
  urlImagenItem: string;
  oferta: boolean;
  form: FormGroup;
  submitted = false;
  loading = false;

  constructor(private fb: FormBuilder,
              public activeModal: NgbActiveModal,
              private pedidosService: PedidosService) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      cantidad: [this.cantidad, [Validators.required, Validators.min(0.1)]]
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const cant = this.form.value.cantidad;
      const nrp: NuevoRenglonPedido = {
        idProductoItem: this.idProductoItem,
        cantidad: cant,
      };

      this.loading = true;
      this.pedidosService.calcularRenglones([nrp], this.cliente.id_Cliente)
        .pipe(finalize(() => this.loading = false))
        .subscribe(data =>  {
          const rp: RenglonPedido = data[0];
          this.activeModal.close(rp);
        });
    }
  }
}
