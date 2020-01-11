import { Component, OnInit } from '@angular/core';
import { Pedido } from '../../models/pedido';
import { PedidosService } from '../../services/pedidos.service';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { RenglonPedido } from '../../models/renglon-pedido';
import { saveAs } from 'file-saver';
import { TipoDeEnvio } from '../../models/tipo-de-envio';
import { Location } from '@angular/common';

@Component({
  selector: 'app-ver-pedido',
  templateUrl: './ver-pedido.component.html',
  styleUrls: ['./ver-pedido.component.scss']
})
export class VerPedidoComponent implements OnInit {
  loading = false;
  pedido: Pedido = null;
  renglones: RenglonPedido[] = [];

  tipoDeEnvio = TipoDeEnvio;

  constructor(private route: ActivatedRoute,
              private pedidosService: PedidosService,
              private location: Location) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    combineLatest([
      this.pedidosService.getPedido(id),
      this.pedidosService.getRenglonesDePedido(id),
    ])
      .pipe(finalize(() => this.loading = false))
      .subscribe((v: [Pedido, RenglonPedido[]]) => {
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

  downloadPedidoPdf(pedido: Pedido) {
    this.pedidosService.getPedidoPdf(pedido.idPedido).subscribe(
      (res) => {
        const file = new Blob([res], {type: 'application/pdf'});
        saveAs(file, `pedido-${pedido.nroPedido}.pdf`);
      }
    );
  }

  getEnvioLabel() {
    if (!this.pedido || !this.pedido.tipoDeEnvio) {
      return '';
    }

    if (this.pedido.tipoDeEnvio === TipoDeEnvio.RETIRO_EN_SUCURSAL) {
      return 'Retiro en Sucursal';
    }

    if (
      this.pedido.tipoDeEnvio === TipoDeEnvio.USAR_UBICACION_FACTURACION ||
      this.pedido.tipoDeEnvio === TipoDeEnvio.USAR_UBICACION_ENVIO
    ) {
      return 'Envio a Domicilio';
    }
  }

  volverAlListado() {
    this.location.back();
  }
}
