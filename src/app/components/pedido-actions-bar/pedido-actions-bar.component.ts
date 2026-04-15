import { AuthService } from './../../services/auth.service';
import { finalize } from 'rxjs/operators';
import { PedidosService } from './../../services/pedidos.service';
import { LoadingOverlayService } from './../../services/loading-overlay.service';
import { StorageKeys, StorageService } from './../../services/storage.service';
import { MensajeModalType } from './../mensaje-modal/mensaje-modal.component';
import { MensajeService } from './../../services/mensaje.service';
import { Router } from '@angular/router';
import { Rol } from './../../models/rol';
import { EstadoPedido } from './../../models/estado-pedido';
import { Pedido } from './../../models/pedido';
import { Component, OnInit, Input } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';

type PedidoActionButtonName = 'show'|'download'|'edit'|'clone'|'delete'|'invoice'|'show-invoice'|'show-cc';

@Component({
  selector: 'app-pedido-actions-bar',
  templateUrl: './pedido-actions-bar.component.html'
})
export class PedidoActionsBarComponent implements OnInit {

  private pPedido: Pedido;
  @Input() set pedido(value: Pedido) { this.pPedido = value; }
  get pedido(): Pedido { return this.pPedido; }
  private pHiddenButtons: PedidoActionButtonName[] = [];
  @Input() set hiddenButtons(value: PedidoActionButtonName[]) { this.pHiddenButtons = value; }
  get hiddenButtons(): PedidoActionButtonName[] { return this.pHiddenButtons; }

  hiddenButtonsValues = {
    'show': false,
    'download': false,
    'edit': false,
    'clone': false,
    'delete': false,
    'invoice': false,
    'show-invoice': false,
    'show-cc': false
  }

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRolToDelete = false;

  allowedRolesToEdit: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRolToEdit = false;

  allowedRolesToViewCC: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRolToViewCC = false;

  puedeEliminarPedido = false;
  puedeEditarPedido = false;
  puedeFacturarPedido = false;
  puedeVerFacturas = false;
  puedeVerCtaCte = false;

  constructor(private readonly router: Router,
              private readonly authService: AuthService,
              private readonly mensajeService: MensajeService,
              private readonly loadingOverlayService: LoadingOverlayService,
              private readonly pedidosService: PedidosService,
              private readonly storageService: StorageService) {
    this.hasRolToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    this.hasRolToEdit = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToEdit);
    this.hasRolToViewCC = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToViewCC);
  }

  ngOnInit(): void {
    this.puedeEliminarPedido = this.hasRolToDelete && this.pedido.estado === EstadoPedido.ABIERTO;
    this.puedeEditarPedido = this.hasRolToEdit && this.pedido.estado === EstadoPedido.ABIERTO;
    this.puedeFacturarPedido = this.hasRolToEdit && this.pedido.estado === EstadoPedido.ABIERTO;
    this.puedeVerFacturas = [EstadoPedido.CERRADO].includes(this.pedido.estado);
    this.puedeVerCtaCte = this.hasRolToViewCC;
    Object.keys(this.hiddenButtonsValues).forEach((k: PedidoActionButtonName) => {
      this.hiddenButtonsValues[k] = this.hiddenButtons.includes(k);
    });
  }

  verPedido() {
    this.router.navigate(['/pedidos/ver', this.pedido.idPedido]);
  }

  verCtaCte() {
    this.router.navigate(['/clientes/cuenta-corriente', this.pedido.cliente.idCliente]);
  }

  cancelarPedido() {
    if (!this.puedeEliminarPedido) {
      this.mensajeService.msg('No posee permiso para cancelar un pedido.', MensajeModalType.ERROR);
      return;
    }

    const msg = `¿Está seguro que desea cancelar el pedido #${this.pedido.nroPedido}?`;

    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.pedidosService.cancelarPedido(this.pedido.idPedido)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: () => { location.reload(); },
            error: (err) => {
              this.mensajeService.msg(`Error: ${err.error}`, MensajeModalType.ERROR)
                .then(() => { return; }, () => { return; });
            },
          });
      }
    }, () => { return; });
  }

  editarPedido() {
    if (!this.puedeEditarPedido) {
      this.mensajeService.msg('No posee permiso para editar un pedido.', MensajeModalType.ERROR);
      return;
    }
    this.storageService.removeItem(StorageKeys.PEDIDO_EDITAR);
    this.router.navigate(['/pedidos/editar', this.pedido.idPedido]);
  }

  clonarPedido() {
    this.storageService.removeItem(StorageKeys.PEDIDO_NUEVO);
    this.router.navigate(['/pedidos/nuevo'], { queryParams: { idToClone: this.pedido.idPedido }});
  }

  facturarPedido() {
    if (!this.puedeFacturarPedido) {
      this.mensajeService.msg('No posee permiso para facturar un pedido.', MensajeModalType.ERROR);
      return;
    }
    this.storageService.removeItem(StorageKeys.PEDIDO_FACTURAR);
    this.router.navigate(['/facturas-venta/de-pedido', this.pedido.idPedido]);
  }

  verFacturas() {
    if (this.puedeVerFacturas) {
      this.router.navigate(['/facturas-venta'], { queryParams: { nroPedido: this.pedido.nroPedido }});
    }
  }

  downloadPedidoPdf() {
    this.loadingOverlayService.activate();
    this.pedidosService.getPedidoPdf(this.pedido.idPedido)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (res) => HelperService.openFileUrlFromBlob(res),
        error: () => {
          this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR)
            .then(() => { return; }, () => { return; });
        },
      });
  }
}
