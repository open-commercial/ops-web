import { finalize } from 'rxjs/operators';
import { AuthService } from './../../../../services/auth.service';
import { Rol } from './../../../../models/rol';
import { GastosService } from './../../../../services/gastos.service';
import { LoadingOverlayService } from './../../../../services/loading-overlay.service';
import { MensajeModalType } from './../../../../components/mensaje-modal/mensaje-modal.component';
import { MensajeService } from './../../../../services/mensaje.service';
import { Router } from '@angular/router';
import { Gasto } from './../../../../models/gasto';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

type GastoActionButtonName = 'show'|'delete';

@Component({
  selector: 'app-gasto-actions-bar',
  templateUrl: './gasto-actions-bar.component.html'
})
export class GastoActionsBarComponent implements OnInit {
  private pGasto: Gasto;
  @Input() set gasto(value: Gasto) { this.pGasto = value }
  get gasto(): Gasto { return this.pGasto; }

  allowedRolesToSee: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToSee = false;

  allowedRolesToDelete: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToDelete = false;

  private pHiddenButtons: GastoActionButtonName[] = [];
  @Input() set hiddenButtons(value: GastoActionButtonName[]) { this.pHiddenButtons = value; }
  get hiddenButtons(): GastoActionButtonName[] { return this.pHiddenButtons; }

  hiddenButtonsValues = {
    'show': false,
    'delete': false,
  };

  @Output() afterDelete = new EventEmitter<void>();

  constructor(private router: Router,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private authService: AuthService,
              private gastosService: GastosService) {
    this.hasRoleToSee = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToSee);
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
  }

  ngOnInit(): void {
    Object.keys(this.hiddenButtonsValues).forEach((k: GastoActionButtonName) => {
      this.hiddenButtonsValues[k] = this.hiddenButtons.indexOf(k) >= 0;
    });
  }

  async verGasto() {
    if (!this.hasRoleToSee) {
      await this.mensajeService.msg('No posee permiso para ver el gasto', MensajeModalType.ERROR);
      return;
    }

    await this.router.navigate(['/gastos/ver', this.gasto.idGasto]);
  }

  async eliminarGasto() {
    if (!this.hasRoleToDelete) {
      await this.mensajeService.msg('No posee permiso para eliminar el gasto', MensajeModalType.ERROR);
      return;
    }

    const msg = '¿Está seguro que desea eliminar / anular el gasto seleccionado?';
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.gastosService.eliminarGasto(this.gasto.idGasto)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: () => this.afterDelete.emit(),
            error: err => {
              this.loadingOverlayService.deactivate();
              this.mensajeService.msg(err.error, MensajeModalType.ERROR)
                .then(() => { return; }, () => { return; });
            },
          })
        ;
      }
    }, () => { return; });
  }
}
