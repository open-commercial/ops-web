import { NotasService } from './../../services/notas.service';
import { ConfiguracionesSucursalService } from './../../services/configuraciones-sucursal.service';
import { AuthService } from './../../services/auth.service';
import { LoadingOverlayService } from './../../services/loading-overlay.service';
import { MensajeService } from 'src/app/services/mensaje.service';
import { Router } from '@angular/router';
import { NotaActionsBarDirective } from 'src/app/directives/nota-actions-bar.directive';
import { Component } from '@angular/core';

@Component({
  selector: 'app-nota-debito-actions-bar',
  templateUrl: './nota-debito-actions-bar.component.html'
})
export class NotaDebitoActionsBarComponent extends NotaActionsBarDirective {

  constructor(protected router: Router,
              protected mensajeService: MensajeService,
              protected loadingOverlayService: LoadingOverlayService,
              protected authService: AuthService,
              protected configuracionesSucursalService: ConfiguracionesSucursalService,
              protected notasService: NotasService) {
    super(router, mensajeService, loadingOverlayService, authService, configuracionesSucursalService, notasService)
  }
}
