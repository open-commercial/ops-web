import { Cliente } from './../../models/cliente';
import { NotaDebitoVentaDetalleReciboModalComponent } from './../nota-debito-venta-detalle-recibo-modal/nota-debito-venta-detalle-recibo-modal.component';
import { NotaDebito } from './../../models/nota';
import { NuevaNotaDebitoDeRecibo } from './../../models/nueva-nota-debito-de-recibo';
import { NotaDebitoVentaReciboModalComponent } from './../nota-debito-venta-recibo-modal/nota-debito-venta-recibo-modal.component';
import { NotasService } from './../../services/notas.service';
import { ConfiguracionesSucursalService } from './../../services/configuraciones-sucursal.service';
import { ClientesService } from './../../services/clientes.service';
import { RecibosService } from './../../services/recibos.service';
import { AuthService } from './../../services/auth.service';
import { LoadingOverlayService } from './../../services/loading-overlay.service';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';
import { finalize } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReciboActionsBarDirective } from 'src/app/directives/recibo-actions-bar.directive';
import { MensajeService } from 'src/app/services/mensaje.service';
import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-recibo-venta-actions-bar',
  templateUrl: './recibo-venta-actions-bar.component.html'
})
export class ReciboVentaActionsBarComponent extends ReciboActionsBarDirective {

  constructor(protected router: Router,
              protected mensajeService: MensajeService,
              protected loadingOverlayService: LoadingOverlayService,
              protected authService: AuthService,
              protected recibosService: RecibosService,
              private clientesService: ClientesService,
              private configuracionesSucursalService: ConfiguracionesSucursalService,
              private notasService: NotasService,
              private modalService: NgbModal) {
    super(router, mensajeService, loadingOverlayService, authService, recibosService);
  }


  doCrearNotaDebitoRecibo() {
    this.loadingOverlayService.activate();
    this.clientesService.getCliente(this.recibo.idCliente)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (c: Cliente) => {
          const modalRef = this.modalService.open(NotaDebitoVentaReciboModalComponent, { backdrop: 'static' });
          modalRef.componentInstance.cliente = c;
          modalRef.componentInstance.idRecibo = this.recibo.idRecibo;
          modalRef.result
            .then((data: [NuevaNotaDebitoDeRecibo, NotaDebito]) => {
              const modalRef2 = this.modalService.open(NotaDebitoVentaDetalleReciboModalComponent, { backdrop: 'static', size: 'lg' });
              modalRef2.componentInstance.nnddr = data[0];
              modalRef2.componentInstance.notaDebito = data[1];
              modalRef2.componentInstance.cliente = c;
              modalRef2.result.then(
                (nota: NotaDebito) => this.showNotaCreationSuccessMessage(nota, 'Nota de Débito creada correctamente.', () => {
                  this.doAutorizar(nota.idNota);
                }),
                () => { return; }
              );
            }, () => { return; })
          ;
        },
        error: async err => { await this.mensajeService.msg(err.error, MensajeModalType.ERROR); },
      });
  }

  doAutorizar(idNota: number, callback = () => { return; }) {
    this.loadingOverlayService.activate();
    this.configuracionesSucursalService.isFacturaElectronicaHabilitada()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: async habilitada => {
          if (habilitada) {
            this.loadingOverlayService.activate();
            this.notasService.autorizar(idNota)
              .pipe(finalize(() => this.loadingOverlayService.deactivate()))
              .subscribe({
                next: async () => {
                  this.mensajeService.msg('La Nota fue autorizada por AFIP correctamente!', MensajeModalType.INFO);
                  callback();
                },
                error: err => {
                  this.mensajeService.msg(err.error, MensajeModalType.ERROR);
                  callback();
                },
              })
            ;
          } else {
            await this.mensajeService.msg('La funcionalidad de Factura Electronica no se encuentra habilitada.', MensajeModalType.ERROR);
          }
        },
        error: async err => { await this.mensajeService.msg(err.error, MensajeModalType.ERROR); },
      });
  }

  downloadReciboPdf() {
    this.loadingOverlayService.activate();
    this.recibosService.getReporteRecibo(this.recibo.idRecibo)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: res => {
          const file = new Blob([res], {type: 'application/pdf'});
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL, '_blank');
        },
        error: async () => { await this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR) },
      })
    ;
  }
}
