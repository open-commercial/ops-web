import { Component, OnInit } from '@angular/core';
import {Movimiento} from '../../models/movimiento';
import {NotasDebitoDirective} from '../../directives/notas-debito.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../services/sucursales.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {ClientesService} from '../../services/clientes.service';
import {UntypedFormBuilder} from '@angular/forms';
import {UsuariosService} from '../../services/usuarios.service';
import {AuthService} from '../../services/auth.service';
import {ConfiguracionesSucursalService} from '../../services/configuraciones-sucursal.service';
import {NotasService} from '../../services/notas.service';
import {ProveedoresService} from '../../services/proveedores.service';

@Component({
  selector: 'app-notas-debito-compra',
  templateUrl: './notas-debito-compra.component.html',
  styleUrls: ['./notas-debito-compra.component.scss']
})
export class NotasDebitoCompraComponent extends NotasDebitoDirective implements OnInit {
  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected clientesService: ClientesService,
              protected fb: UntypedFormBuilder,
              protected usuariosService: UsuariosService,
              protected authService: AuthService,
              protected configuracionesSucursalService: ConfiguracionesSucursalService,
              protected notasService: NotasService,
              protected proveedoresService: ProveedoresService) {
    super(
      route, router, sucursalesService, loadingOverlayService, mensajeService,
      clientesService, fb, usuariosService, authService, configuracionesSucursalService,
      notasService, proveedoresService
    );
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getMovimiento(): Movimiento {
    return Movimiento.COMPRA;
  }
}
