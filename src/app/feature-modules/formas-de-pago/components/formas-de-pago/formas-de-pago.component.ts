import {Component, OnInit} from '@angular/core';
import {FormasDePagoService} from '../../../../services/formas-de-pago.service';
import {FormaDePago} from '../../../../models/forma-de-pago';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {finalize} from 'rxjs/operators';
import {MensajeService} from '../../../../services/mensaje.service';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';
import {Router} from '@angular/router';
import {Rol} from '../../../../models/rol';
import {AuthService} from '../../../../services/auth.service';

@Component({
  selector: 'app-formas-de-pago',
  templateUrl: './formas-de-pago.component.html',
})
export class FormasDePagoComponent implements OnInit {
  formasDePago: FormaDePago[] = [];
  allowedRolesToSetDefault: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToSetDefault = false;
  constructor(private formasDePagoService: FormasDePagoService,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private router: Router,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.hasRoleToSetDefault = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToSetDefault);
    this.loadFormasDePago();
  }

  loadFormasDePago() {
    this.loadingOverlayService.activate();
    this.formasDePagoService.getFormasDePago()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: formasDePago => this.formasDePago = formasDePago,
        error: err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.router.navigate(['/']);
        }
      })
    ;
  }

  setAsDefault(fdp: FormaDePago) {
    if (!this.hasRoleToSetDefault) {
      this.mensajeService.msg('No tiene permiso para ver establecer como predeterminada una forma de pago.');
      return;
    }

    const msg = `Esta seguro que desea establecer a "${fdp.nombre}" como la forma predeterminada de pago?`;
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.formasDePagoService.setFormaDePagoPredeterminada(fdp.idFormaDePago)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: () => this.loadFormasDePago(),
            error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
          })
        ;
      }
    });
  }
}
