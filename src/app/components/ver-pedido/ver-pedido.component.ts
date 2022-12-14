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
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {MensajeService} from '../../services/mensaje.service';

@Component({
  selector: 'app-ver-pedido',
  templateUrl: './ver-pedido.component.html',
  styleUrls: ['./ver-pedido.component.scss']
})
export class VerPedidoComponent implements OnInit {
  pedido: Pedido = null;
  renglones: RenglonPedido[] = [];

  tipoDeEnvio = TipoDeEnvio;

  constructor(private route: ActivatedRoute,
              private pedidosService: PedidosService,
              private location: Location,
              public loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService) { }

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
      })
    ;
  }

  getNombreCliente() {
    let ret = '';
    if (this.pedido && this.pedido.cliente) {
      const c = this.pedido.cliente;
      ret = `#${c.nroCliente} - ${c.nombreFiscal}` + (c.nombreFantasia ? ` - ${c.nombreFantasia}` : '');
    }
    return ret;
  }

  downloadPedidoPdf(pedido: Pedido) {
    this.loadingOverlayService.activate();
    this.pedidosService.getPedidoPdf(pedido.idPedido)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (res) => {
          const file = new Blob([res], {type: 'application/pdf'});
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL, '_blank');
        },
        () => this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR),
      )
    ;
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
