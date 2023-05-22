import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';
import { NotaDebitoCompraDetalleReciboModalComponent } from './../../feature-modules/cuentas-corrientes-proveedor/components/nota-debito-compra-detalle-recibo-modal/nota-debito-compra-detalle-recibo-modal.component';
import { NotaDebito } from './../../models/nota';
import { NuevaNotaDebitoDeRecibo } from './../../models/nueva-nota-debito-de-recibo';
import { NotaDebitoCompraReciboModalComponent } from './../../feature-modules/cuentas-corrientes-proveedor/components/nota-debito-compra-recibo-modal/nota-debito-compra-recibo-modal.component';
import { Proveedor } from './../../models/proveedor';
import { finalize } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProveedoresService } from './../../services/proveedores.service';
import { RecibosService } from './../../services/recibos.service';
import { AuthService } from './../../services/auth.service';
import { LoadingOverlayService } from './../../services/loading-overlay.service';
import { ReciboActionsBarDirective } from 'src/app/directives/recibo-actions-bar.directive';
import { MensajeService } from 'src/app/services/mensaje.service';
import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-recibo-compra-actions-bar',
  templateUrl: './recibo-compra-actions-bar.component.html'
})
export class ReciboCompraActionsBarComponent extends ReciboActionsBarDirective {

  constructor(protected router: Router,
              protected mensajeService: MensajeService,
              protected loadingOverlayService: LoadingOverlayService,
              protected authService: AuthService,
              protected recibosService: RecibosService,
              private proveedoresService: ProveedoresService,
              private modalService: NgbModal) {
    super(router, mensajeService, loadingOverlayService, authService, recibosService);
  }

  doCrearNotaDebitoRecibo() {
    this.loadingOverlayService.activate();
    this.proveedoresService.getProveedor(this.recibo.idProveedor)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (p: Proveedor) => {
          const modalRef = this.modalService.open(NotaDebitoCompraReciboModalComponent, { backdrop: 'static' });
          modalRef.componentInstance.proveedor = p;
          modalRef.componentInstance.idRecibo = this.recibo.idRecibo;
          modalRef.result.then((data: [NuevaNotaDebitoDeRecibo, NotaDebito]) => {
            const modalRef2 = this.modalService.open(NotaDebitoCompraDetalleReciboModalComponent, { backdrop: 'static'});
            modalRef2.componentInstance.nndr = data[0];
            modalRef2.componentInstance.notaDebito = data[1];
            modalRef2.componentInstance.proveedor = p;
            modalRef2.result.then(
              (nota: NotaDebito) => this.showNotaCreationSuccessMessage(nota, 'Nota de Débito creada correctamente.'),
              () => { return; }
            );
          }, () => { return; });
        },
        error: err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR)
            .then(() => { return; }, () => { return; });
        },
      })
    ;
  }
}
