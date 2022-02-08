import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../services/sucursales.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {FormBuilder} from '@angular/forms';
import {NotasDebitoDirective} from '../../directives/notas-debito.directive';
import {ClientesService} from '../../services/clientes.service';
import {UsuariosService} from '../../services/usuarios.service';
import {AuthService} from '../../services/auth.service';
import {ConfiguracionesSucursalService} from '../../services/configuraciones-sucursal.service';
import {NotasService} from '../../services/notas.service';
import {Movimiento} from '../../models/movimiento';
import {ProveedoresService} from '../../services/proveedores.service';

@Component({
  selector: 'app-notas-debito-venta',
  templateUrl: './notas-debito-venta.component.html',
  styleUrls: ['./notas-debito-venta.component.scss']
})
export class NotasDebitoVentaComponent extends NotasDebitoDirective implements OnInit {
  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected clientesService: ClientesService,
              protected fb: FormBuilder,
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
    return Movimiento.VENTA;
  }
}
