import { AuthService } from './../../../../services/auth.service';
import { Rol } from './../../../../models/rol';
import { Router } from '@angular/router';
import { MensajeService } from 'src/app/services/mensaje.service';
import { finalize } from 'rxjs/operators';
import { MedidasService } from './../../../../services/medidas.service';
import { LoadingOverlayService } from './../../../../services/loading-overlay.service';
import { Medida } from './../../../../models/medida';
import { Component, OnInit } from '@angular/core';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-medidas',
  templateUrl: './medidas.component.html'
})
export class MedidasComponent implements OnInit {
  medidas: Medida[] = [];

  allowedRolesToManageMedidas: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToManageMedidas = false;

  allowedRolesToDelete: Rol[] = [Rol.ADMINISTRADOR];
  hasRoleToDelete = false;

  constructor(private router: Router,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private authService: AuthService,
              private medidasService: MedidasService) { }

  ngOnInit(): void {
    this.hasRoleToManageMedidas = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToManageMedidas);
    if (!this.hasRoleToManageMedidas) {
      this.mensajeService.msg('Ud. no tiene permisos para administrar medidas.');
      this.router.navigate(["/"]);
    }

    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    this.loadMedidas();
  }

  loadMedidas() {
    this.loadingOverlayService.activate();
    this.medidasService.getMedidas()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: medidas => this.medidas = medidas,
        error: err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.router.navigate(['/']);
        }
      })
    ;
  }

  nuevaMedida() {
    if (!this.allowedRolesToManageMedidas) {
      this.mensajeService.msg('Ud. no tiene permisos para dar de alta medidas.');
      return;
    }

    this.router.navigate(['/medidas/nueva']);
  }

  editarMedida(m: Medida) {
    if (!this.allowedRolesToManageMedidas) {
      this.mensajeService.msg('Ud. no tiene permisos para editar medidas.');
      return;
    }

    this.router.navigate(['/medidas/editar', m.idMedida]);
  }

  eliminarMedida(m: Medida) {
    if (!this.allowedRolesToDelete) {
      this.mensajeService.msg('Ud. no tiene permisos para eliminar medidas.');
      return;
    }

    const msg = `¿Está seguro de eliminar la medida "${m.nombre}"?`;
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.medidasService.eliminarMedida(m.idMedida)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: () => {
              this.mensajeService.msg(`La medida "${m.nombre}" fue eliminada correctamente.`, MensajeModalType.INFO);
              this.loadMedidas();
            },
            error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
          })
        ;
      }
    });
  }
}
