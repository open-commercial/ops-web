import { Component, OnInit } from '@angular/core';
import { Pedido } from '../../models/pedido';
import { PedidosService } from '../../services/pedidos.service';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { RenglonPedido } from '../../models/renglon-pedido';

@Component({
  selector: 'app-ver-pedido',
  templateUrl: './ver-pedido.component.html',
  styleUrls: ['./ver-pedido.component.scss']
})
export class VerPedidoComponent implements OnInit {
  loading = false;
  pedido: Pedido = null;
  renglones: RenglonPedido[] = [];

  constructor(private route: ActivatedRoute,
              private pedidosService: PedidosService) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    combineLatest([
      this.pedidosService.getPedido(id),
      this.pedidosService.getRenglonesDePedido(id),
    ])
      .pipe(finalize(() => this.loading = false))
      .subscribe((v: [Pedido, RenglonPedido[]]) => {
        console.log(v);
        this.pedido = v[0];
        this.renglones = v[1];
      })
    ;
  }

  getNombreCliente() {
    let ret = '';
    if (this.pedido && this.pedido.cliente) {
      const c = this.pedido.cliente;
      ret = `(#${c.nroCliente}) ${c.nombreFiscal}` + (c.nombreFantasia ? ` - ${c.nombreFantasia}` : '');
    }
    return ret;
  }
}
