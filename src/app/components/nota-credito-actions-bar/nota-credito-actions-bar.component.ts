import { Movimiento } from './../../models/movimiento';
import { NotasService } from './../../services/notas.service';
import { ConfiguracionesSucursalService } from './../../services/configuraciones-sucursal.service';
import { AuthService } from './../../services/auth.service';
import { LoadingOverlayService } from './../../services/loading-overlay.service';
import { MensajeService } from 'src/app/services/mensaje.service';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { NotaActionsBarDirective } from 'src/app/directives/nota-actions-bar.directive';

@Component({
  selector: 'app-nota-credito-actions-bar',
  templateUrl: './nota-credito-actions-bar.component.html'
})
export class NotaCreditoActionsBarComponent extends NotaActionsBarDirective {

  constructor(protected router: Router,
              protected mensajeService: MensajeService,
              protected loadingOverlayService: LoadingOverlayService,
              protected authService: AuthService,
              protected configuracionesSucursalService: ConfiguracionesSucursalService,
              protected notasService: NotasService) {
    super(router, mensajeService, loadingOverlayService, authService, configuracionesSucursalService, notasService);
  }

  verFactura() {
    let idFactura = null;
    let path = '';

    if (this.nota.movimiento === Movimiento.VENTA) {
      idFactura = this.nota.idFacturaVenta;
      path = '/facturas-venta/ver';
    } else if (this.nota.movimiento === Movimiento.COMPRA) {
      idFactura = this.nota.idFacturaCompra;
      path = '/facturas-compra/ver';
    } else {
      return;
    }

    this.router.navigate([path, idFactura]);
  }
}
