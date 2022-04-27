import { Router } from '@angular/router';
import { Rol } from './../../../../models/rol';
import { AuthService } from './../../../../services/auth.service';
import { finalize } from 'rxjs/operators';
import { MensajeService } from './../../../../services/mensaje.service';
import { LoadingOverlayService } from './../../../../services/loading-overlay.service';
import { Sucursal } from './../../../../models/sucursal';
import { Component, OnInit } from '@angular/core';
import { SucursalesService } from 'src/app/services/sucursales.service';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-sucursales',
  templateUrl: './sucursales.component.html',
})
export class SucursalesComponent implements OnInit {
  sucursales: Sucursal[] = [];

  allowedRolesToAdministrarSucursales: Rol[] = [Rol.ADMINISTRADOR];

  hasRoleToAdministrarSucursales = false;


  constructor(private loadingOverlayService: LoadingOverlayService,
              private router: Router,
              private mensajeService: MensajeService,
              private sucursalesService: SucursalesService,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.hasRoleToAdministrarSucursales = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToAdministrarSucursales);

    this.loadingOverlayService.activate();
    this.sucursalesService.getSucursales()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: sucursales => this.sucursales = sucursales,
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

  nuevaSucursal() {
    if (!this.hasRoleToAdministrarSucursales) {
      this.mensajeService.msg('No tiene permisos para crear sucursales', MensajeModalType.ERROR);
      return;
    }

    this.router.navigate(['/sucursales/nueva']);
  }

  editarSucursal(sucursal: Sucursal) {
    if (!this.hasRoleToAdministrarSucursales) {
      this.mensajeService.msg('No tiene permisos para editar sucursales', MensajeModalType.ERROR);
      return;
    }

    this.router.navigate(['/sucursales/editar', sucursal.idSucursal]);
  }
}
