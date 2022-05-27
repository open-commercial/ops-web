import { HelperService } from './../../../../services/helper.service';
import { AuthService } from './../../../../services/auth.service';
import { Rol } from './../../../../models/rol';
import { finalize } from 'rxjs/operators';
import { Rubro } from './../../../../models/rubro';
import { MensajeService } from './../../../../services/mensaje.service';
import { LoadingOverlayService } from './../../../../services/loading-overlay.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { RubrosService } from 'src/app/services/rubros.service';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-rubros',
  templateUrl: './rubros.component.html',
})
export class RubrosComponent implements OnInit {
  rubros: Rubro[] = [];

  allowedRolesToViewList = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToViewList = false;

  allowedRolesToCreate = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToCreate = false;

  allowedRolesToUpdate = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToUpdate = false;

  allowedRolesToDelete = [Rol.ADMINISTRADOR];
  hasRoleToDelete = false;

  constructor(private router: Router,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private authService: AuthService,
              private rubrosService: RubrosService) {}

  ngOnInit(): void {
    this.hasRoleToViewList = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToViewList);
    if (!this.hasRoleToViewList) {
      this.mensajeService.msg('Ud. no tiene permisos para ver el listado de rubros.', MensajeModalType.ERROR);
      this.router.navigate(['']);
      return;
    }

    this.hasRoleToCreate = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCreate);
    this.hasRoleToUpdate = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToUpdate);
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);

    this.getRubros();
  }

  getRubros() {
    this.loadingOverlayService.activate();
    this.rubrosService.getRubros()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: rubros => this.rubros = rubros,
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

  nuevoRubro() {
    if (!this.hasRoleToCreate) {
      this.mensajeService.msg('Ud. no tiene permisos para crear rubros.', MensajeModalType.ERROR);
      return;
    }
    this.router.navigate(['/rubros/nuevo']);
  }

  editarRubro(r: Rubro) {
    if (!this.hasRoleToUpdate) {
      this.mensajeService.msg('Ud. no tiene permisos para editar rubros.', MensajeModalType.ERROR);
      return;
    }

    this.router.navigate(['/rubros/editar', r.idRubro])
  }

  eliminarRubro(r: Rubro) {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('Ud. no tiene permisos para eliminar rubros.', MensajeModalType.ERROR);
      return;
    }

    const msg = 'Esta seguro que desea eliminar el rubro seleccionado?';
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.rubrosService.eliminarRubro(r.idRubro)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: () => {
              this.mensajeService.msg(`El rubro "${r.nombre}" fue eliminado correctamente.`);
              this.getRubros();
            },
            error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
          })
        ;
      }
    });
  }
}
