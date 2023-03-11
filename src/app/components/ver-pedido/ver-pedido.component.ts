import { EstadoPedido } from './../../models/estado-pedido';
import { Component, OnInit } from '@angular/core';
import { Pedido } from '../../models/pedido';
import { PedidosService } from '../../services/pedidos.service';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { RenglonPedido } from '../../models/renglon-pedido';
import { TipoDeEnvio } from '../../models/tipo-de-envio';
import { Location } from '@angular/common';
import { LoadingOverlayService } from '../../services/loading-overlay.service';

@Component({
  selector: 'app-ver-pedido',
  templateUrl: './ver-pedido.component.html',
  styleUrls: ['./ver-pedido.component.scss']
})
export class VerPedidoComponent implements OnInit {
  pedido: Pedido = null;
  renglones: RenglonPedido[] = [];

  tipoDeEnvio = TipoDeEnvio;

  nombreCliente = '';
  envioLabel = '';

  estado = EstadoPedido;

  constructor(private route: ActivatedRoute,
              private pedidosService: PedidosService,
              private location: Location,
              public loadingOverlayService: LoadingOverlayService) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadingOverlayService.activate();
    combineLatest([
      this.pedidosService.getPedido(id),
      this.pedidosService.getRenglonesDePedido(id),
    ])
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe((v: [Pedido, RenglonPedido[]]) => {
        this.pedido = v[0];
        this.renglones = v[1];

        this.nombreCliente = this.getNombreCliente();
        this.envioLabel = this.getEnvioLabel();
      })
    ;
  }

  private getNombreCliente() {
    let ret = '';
    if (this.pedido && this.pedido.cliente) {
      const c = this.pedido.cliente;
      ret = `${c.nroCliente} - ${c.nombreFiscal}` + (c.nombreFantasia ? ` - ${c.nombreFantasia}` : '');
    }
    return ret;
  }

  private getEnvioLabel() {
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
