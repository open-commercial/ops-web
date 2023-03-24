import { finalize } from 'rxjs/operators';
import { AuthService } from './../../services/auth.service';
import { Rol } from './../../models/rol';
import { RemitosService } from './../../services/remitos.service';
import { LoadingOverlayService } from './../../services/loading-overlay.service';
import { HelperService } from './../../services/helper.service';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';
import { MensajeService } from './../../services/mensaje.service';
import { Router } from '@angular/router';
import { Remito } from './../../models/remito';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

type RemitoActionButtonName = 'show'|'delete'|'download';

@Component({
  selector: 'app-remito-actions-bar',
  templateUrl: './remito-actions-bar.component.html'
})
export class RemitoActionsBarComponent implements OnInit {
  private pRemito: Remito;
  @Input() set remito(value: Remito) { this.pRemito = value; }
  get remito(): Remito { return this.pRemito; }

  private pHiddenButtons: RemitoActionButtonName[] = [];
  @Input() set hiddenButtons(value: RemitoActionButtonName[]) { this.pHiddenButtons = value; }
  get hiddenButtons(): RemitoActionButtonName[] { return this.pHiddenButtons; }

  @Output() afterDelete = new EventEmitter<void>();

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR ];
  hasRoleToDelete = false;

  hiddenButtonsValues = {
    'show': false,
    'delete': false,
    'download': false,
  };

  constructor(private router: Router,
              private mensajeService: MensajeService,
              private loadingOverlayService: LoadingOverlayService,
              private authService: AuthService,
              private remitosService: RemitosService) {
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
  }

  ngOnInit(): void {
    Object.keys(this.hiddenButtonsValues).forEach((k: RemitoActionButtonName) => {
      this.hiddenButtonsValues[k] = this.hiddenButtons.indexOf(k) >= 0;
    });
  }

  verRemito() {
    this.router.navigate(['/remitos/ver', this.remito.idRemito]);
  }

  eliminarRemito() {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('No posee permiso para eliminar remitos.', MensajeModalType.ERROR);
      return;
    }

    const msg = `¿Está seguro que desea eliminar el remito ` + HelperService.formatNumRemito(this.remito.serie, this.remito.nroRemito) + '?';
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.remitosService.eliminarRemito(this.remito.idRemito)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: () => this.afterDelete.emit(),
            error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
          })
        ;
      }
    });
  }

  downloadRemitoPdf() {
    this.loadingOverlayService.activate();
    this.remitosService.getRemitoPdf(this.remito.idRemito)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (res) => {
          const file = new Blob([res], {type: 'application/pdf'});
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL, '_blank');
        },
        error: () => this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR),
      })
    ;
  }
}
