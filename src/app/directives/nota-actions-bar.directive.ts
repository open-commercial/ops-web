import { NotasService } from '../services/notas.service';
import { ConfiguracionesSucursalService } from '../services/configuraciones-sucursal.service';
import { Movimiento } from '../models/movimiento';
import { finalize } from 'rxjs/operators';
import { LoadingOverlayService } from '../services/loading-overlay.service';
import { TipoDeComprobante } from '../models/tipo-de-comprobante';
import { AuthService } from '../services/auth.service';
import { MensajeService } from '../services/mensaje.service';
import { Router } from '@angular/router';
import { MensajeModalType } from '../components/mensaje-modal/mensaje-modal.component';
import { Rol } from '../models/rol';
import { Nota } from '../models/nota';
import { Directive, Input, Output, EventEmitter, OnInit } from "@angular/core";

type NotaActionButtonName = 'authorize'|'show'|'show-invoice'|'delete'|'download';

@Directive()
export abstract class NotaActionsBarDirective implements OnInit {
  private pNota: Nota;
  @Input() set nota(value: Nota) { this.pNota = value; }
  get nota(): Nota { return this.pNota; }

  @Output() afterDelete = new EventEmitter<void>();

  allowedRolesToAutorizar: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRoleToAutorizar = false;

  allowedRolesToVerDetalle: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRoleToVerDetalle = false;

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR ];
  hasRoleToDelete = false;

  tiposDeComprobantesParaAutorizacion: TipoDeComprobante[] = [
    TipoDeComprobante.NOTA_CREDITO_A,
    TipoDeComprobante.NOTA_CREDITO_B,
    TipoDeComprobante.NOTA_CREDITO_C,
    TipoDeComprobante.NOTA_DEBITO_A,
    TipoDeComprobante.NOTA_DEBITO_B,
    TipoDeComprobante.NOTA_DEBITO_C,
  ];

  private pHiddenButtons: NotaActionButtonName[] = [];
  @Input() set hiddenButtons(value: NotaActionButtonName[]) { this.pHiddenButtons = value; }
  get hiddenButtons(): NotaActionButtonName[] { return this.pHiddenButtons; }

  hiddenButtonsValues = {
    'authorize': false,
    'show': false,
    'show-invoice': false,
    'delete': false,
    'download': false,
  };

  //enum para comprobar en template el movimiento (por ej *ngIf="nota.movimiento === movimiento.VENTA")
  movimiento = Movimiento;

  protected constructor(protected router: Router,
                        protected mensajeService: MensajeService,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected authService: AuthService,
                        protected configuracionesSucursalService: ConfiguracionesSucursalService,
                        protected notasService: NotasService) {
    this.hasRoleToAutorizar = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToAutorizar);
    this.hasRoleToVerDetalle = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToVerDetalle);
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
  }

  ngOnInit(): void {
    Object.keys(this.hiddenButtonsValues).forEach((k: NotaActionButtonName) => {
      this.hiddenButtonsValues[k] = this.hiddenButtons.indexOf(k) >= 0;
    });
  }

  async autorizar() {
    if (!this.hasRoleToAutorizar) {
      await this.mensajeService.msg('No posee permiso para autorizar la nota.', MensajeModalType.ERROR);
      return;
    }

    if (this.tiposDeComprobantesParaAutorizacion.indexOf(this.nota.tipoComprobante) < 0) {
      await this.mensajeService.msg('El tipo de movimiento seleccionado no corresponde con la operación solicitada.', MensajeModalType.ERROR);
      return;
    }

    this.loadingOverlayService.activate();
    this.configuracionesSucursalService.isFacturaElectronicaHabilitada()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: habilitada => {
          if (habilitada) {
            this.loadingOverlayService.activate();
            this.notasService.autorizar(this.nota.idNota)
              .pipe(finalize(() => this.loadingOverlayService.deactivate()))
              .subscribe({
                next: () => {
                  this.mensajeService.msg('La Nota fue autorizada por AFIP correctamente!', MensajeModalType.INFO)
                  .then(() => { return; }, () => { return; });
                },
                error: err => {
                  this.mensajeService.msg(err.error, MensajeModalType.ERROR)
                    .then(() => { return; }, () => { return; });
                },
              })
            ;
          } else {
            this.mensajeService.msg('La funcionalidad de Factura Electronica no se encuentra habilitada.', MensajeModalType.ERROR)
              .then(() => { return; }, () => { return; });
          }
        },
        error: err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR)
            .then(() => { return; }, () => { return; });
        },
      })
    ;
  }

  async verDetalle() {
    if (!this.hasRoleToVerDetalle) {
      await this.mensajeService.msg('No posee permiso para ver la nota.', MensajeModalType.ERROR);
      return;
    }

    let path = '';
    if (this.nota.movimiento === Movimiento.VENTA) {
       path = this.nota.type === 'NotaCredito' ? '/notas-credito-venta/ver' : '/notas-debito-venta/ver';
    } else if (this.nota.movimiento === Movimiento.COMPRA) {
       path = this.nota.type === 'NotaCredito' ? '/notas-credito-compra/ver' : '/notas-debito-compra/ver';
    } else {
       return;
    }

    await this.router.navigate([path, this.nota.idNota]);
  }

  async eliminar() {
    if (!this.hasRoleToDelete) {
      await this.mensajeService.msg('No posee permiso para eliminar la nota.', MensajeModalType.ERROR);
      return;
    }

    const msg = 'Esta seguro que desea eliminar la nota seleccionada?';
    await this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.notasService.eliminar(this.nota.idNota)
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
    });
  }

  dowloadNotaPdf() {
    if (!this.nota.idCliente) { return; }
    this.loadingOverlayService.activate();
    this.notasService.getReporte(this.nota.idNota)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (res) => {
          const file = new Blob([res], {type: 'application/pdf'});
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL, '_blank');
        },
        error: () => {
          this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR)
            .then(() => { return; }, () => { return; });
        },
      })
    ;
  }
}
