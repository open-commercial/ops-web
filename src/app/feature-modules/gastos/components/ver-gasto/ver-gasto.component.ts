import {Component, OnInit} from '@angular/core';
import {Gasto} from '../../../../models/gasto';
import {ActivatedRoute} from '@angular/router';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {GastosService} from '../../../../services/gastos.service';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';
import {Location} from '@angular/common';
import {Rol} from '../../../../models/rol';
import {AuthService} from '../../../../services/auth.service';

@Component({
  selector: 'app-ver-gasto',
  templateUrl: './ver-gasto.component.html'
})
export class VerGastoComponent implements OnInit {
  gasto: Gasto;
  allowedRolesToSee: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToSee = false;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private authService: AuthService,
              private gastosService: GastosService) { }

  ngOnInit(): void {
    this.hasRoleToSee = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToSee);
    if (!this.hasRoleToSee) {
      this.mensajeService.msg('No tiene permisos para ver el gasto.', MensajeModalType.ERROR)
        .then(() => this.volverAtras(), () => { return; });
      return;
    }
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadingOverlayService.activate();
    this.gastosService.getGasto(id)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: gasto => this.gasto = gasto,
        error: err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR).then(() => { return; }, () => { return; });
          this.volverAtras();
        }
      })
    ;
  }

  volverAtras() {
    this.location.back();
  }
}
