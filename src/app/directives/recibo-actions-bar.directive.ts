import { finalize } from 'rxjs/operators';
import { Nota } from './../models/nota';
import { TipoDeComprobante } from './../models/tipo-de-comprobante';
import { AuthService } from './../services/auth.service';
import { Rol } from './../models/rol';
import { RecibosService } from './../services/recibos.service';
import { LoadingOverlayService } from './../services/loading-overlay.service';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';
import { MensajeService } from 'src/app/services/mensaje.service';
import { Router } from '@angular/router';
import { Recibo } from './../models/recibo';
import { Directive, Input, Output, EventEmitter, OnInit } from '@angular/core';

type ReciboActionButtonName = 'show'|'create-nota-debito'|'delete'|'download';

@Directive()
export abstract class ReciboActionsBarDirective implements OnInit {
  private pRecibo: Recibo;
  @Input() set recibo(value: Recibo) { this.pRecibo = value; }
  get recibo(): Recibo { return this.pRecibo; }

  @Output() afterDelete = new EventEmitter<void>();

  allowedRolesToDelete: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToDelete = false;

  allowedRolesToCrearNota: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToCrearNota = false;

  tiposDeComprobantesParaAutorizacion: TipoDeComprobante[] = [
    TipoDeComprobante.NOTA_CREDITO_A,
    TipoDeComprobante.NOTA_CREDITO_B,
    TipoDeComprobante.NOTA_CREDITO_C,
    TipoDeComprobante.NOTA_DEBITO_A,
    TipoDeComprobante.NOTA_DEBITO_B,
    TipoDeComprobante.NOTA_DEBITO_C,
  ];

  private pHiddenButtons: ReciboActionButtonName[] = [];
  @Input() set hiddenButtons(value: ReciboActionButtonName[]) { this.pHiddenButtons = value; }
  get hiddenButtons(): ReciboActionButtonName[] { return this.pHiddenButtons; }

  hiddenButtonsValues = {
    'show': false,
    'delete': false,
    'create-nota-debito': false,
    'download': false,
  };

  protected constructor(protected router: Router,
                        protected mensajeService: MensajeService,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected authService: AuthService,
                        protected recibosService: RecibosService) {
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    this.hasRoleToCrearNota = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCrearNota);
  }

  ngOnInit(): void {
    Object.keys(this.hiddenButtonsValues).forEach((k: ReciboActionButtonName) => {
      this.hiddenButtonsValues[k] = this.hiddenButtons.indexOf(k) >= 0;
    });
  }

  abstract doCrearNotaDebitoRecibo(): void;

  async verRecibo() {
    await this.router.navigate(['/recibos/ver', this.recibo.idRecibo]);
  }

  async eliminarRecibo() {
    if (!this.hasRoleToDelete) {
      await this.mensajeService.msg('No posee permiso para eliminar recibos.', MensajeModalType.ERROR);
      return;
    }

    const msg = 'Esta seguro que desea eliminar el recibo seleccionado?';
    await this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.recibosService.eliminarRecibo(this.recibo.idRecibo)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: () => this.afterDelete.emit(),
            error: async err => {
              this.loadingOverlayService.deactivate();
              await this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            }
          })
        ;
      }
    });
  }

  async crearNotaDeDebitoRecibo() {
    if (!this.hasRoleToCrearNota) {
      await this.mensajeService.msg('No posee permisos para crear notas.', MensajeModalType.ERROR);
      return;
    }

    this.doCrearNotaDebitoRecibo();
  }

  protected async showNotaCreationSuccessMessage(nota: Nota, message: string, callback: () => void = () => { return; }) {
    if (nota.idNota) {
      await this.mensajeService.msg(message, MensajeModalType.INFO).then(
        () => {
          if (this.tiposDeComprobantesParaAutorizacion.indexOf(nota.tipoComprobante) >= 0) {
            callback();
          }
        }
      );
    } else {
      throw new Error('La Nota no posee id');
    }
  }
}
