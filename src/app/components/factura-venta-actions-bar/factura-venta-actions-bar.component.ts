import { NotasService } from './../../services/notas.service';
import { ConfiguracionesSucursalService } from './../../services/configuraciones-sucursal.service';
import { TipoDeComprobante } from './../../models/tipo-de-comprobante';
import { DatePipe } from '@angular/common';
import { NotaCreditoVentaDetalleFacturaModalComponent } from './../nota-credito-venta-detalle-factura-modal/nota-credito-venta-detalle-factura-modal.component';
import { NotaCredito } from './../../models/nota';
import { NuevaNotaCreditoDeFactura } from './../../models/nueva-nota-credito-de-factura';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotaCreditoVentaFacturaModalComponent } from './../nota-credito-venta-factura-modal/nota-credito-venta-factura-modal.component';
import { HelperService } from './../../services/helper.service';
import { finalize } from 'rxjs/operators';
import { FacturasVentaService } from './../../services/facturas-venta.service';
import { LoadingOverlayService } from './../../services/loading-overlay.service';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';
import { MensajeService } from 'src/app/services/mensaje.service';
import { AuthService } from './../../services/auth.service';
import { Rol } from './../../models/rol';
import { Router } from '@angular/router';
import { FacturaVenta } from './../../models/factura-venta';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

type FacturaVentaActionButtonName = 'show'|'email'|'show-remito'|'new-remito'|'create-nota-credito';

@Component({
  selector: 'app-factura-venta-actions-bar',
  templateUrl: './factura-venta-actions-bar.component.html',
  providers: [DatePipe]
})
export class FacturaVentaActionsBarComponent implements OnInit {
  private pFacturaVenta: FacturaVenta;
  @Input() set facturaVenta(value: FacturaVenta) { this.pFacturaVenta = value; }
  get facturaVenta(): FacturaVenta { return this.pFacturaVenta; }

  private pHiddenButtons: FacturaVentaActionButtonName[] = [];
  @Input() set hiddenButtons(value: FacturaVentaActionButtonName[]) { this.pHiddenButtons = value; }
  get hiddenButtons(): FacturaVentaActionButtonName[] { return this.pHiddenButtons; }

  @Output() afterAutorizar = new EventEmitter<void>();
  @Output() afterNoAutorizar = new EventEmitter<void>();

  allowedRolesToEnviarPorEmail: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRoleToEnviarPorEmail = false;

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

  hiddenButtonsValues = {
    'show': false,
    'print': false,
    'email': false,
    'show-remito': false,
    'new-remito': false,
    'create-nota-credito': false
  };

  constructor(private router: Router,
              private authService: AuthService,
              private mensajeService: MensajeService,
              private loadingOverlayService: LoadingOverlayService,
              private modalService: NgbModal,
              private datePipe: DatePipe,
              private facturasVentaService: FacturasVentaService,
              private configuracionesSucursalService: ConfiguracionesSucursalService,
              private notasService: NotasService) {
    this.hasRoleToEnviarPorEmail = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToEnviarPorEmail);
    this.hasRoleToCrearNota = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCrearNota);
  }

  ngOnInit(): void {
    Object.keys(this.hiddenButtonsValues).forEach((k: FacturaVentaActionButtonName) => {
      this.hiddenButtonsValues[k] = this.hiddenButtons.indexOf(k) >= 0;
    });
  }

  async verFactura() {
    await this.router.navigate(['/facturas-venta/ver', this.facturaVenta.idFactura]);
  }

  downloadFacturaPdf() {
    this.loadingOverlayService.activate();
    this.facturasVentaService.getFacturaPdf(this.facturaVenta.idFactura)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (res) => {
          const file = new Blob([res], {type: 'application/pdf'});
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL, '_blank');
        },
        error: async () => {
          await this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR)
        },
      })
    ;
  }

  async enviarPorEmail() {
    if (!this.hasRoleToEnviarPorEmail) {
      await this.mensajeService.msg('No posee permiso para enviar la factura por email.', MensajeModalType.ERROR);
      return;
    }

    const msg = '¿Está seguro que desea enviar un email con la factura al Cliente?';

    await this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.facturasVentaService.enviarPorEmail(this.facturaVenta.idFactura)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: async () => { await this.mensajeService.msg('La factura fue enviada por email.', MensajeModalType.INFO) },
            error: async err => { await this.mensajeService.msg(err.error, MensajeModalType.ERROR) }
          })
        ;
      }
    });
  }

  async verRemito() {
    if (this.facturaVenta.remito) {
      await this.router.navigate(['/remitos/ver', this.facturaVenta.remito.idRemito]);
    }
  }

  async nuevoRemito() {
    if (!this.facturaVenta.remito) {
      await this.router.navigate(['/remitos/de-factura', this.facturaVenta.idFactura]);
    }
  }

  async crearNotaCreditoFactura() {
    if (!this.hasRoleToCrearNota) {
      await this.mensajeService.msg('No posee permiso para crear notas.', MensajeModalType.ERROR);
      return;
    }

    const modalRef = this.modalService.open(NotaCreditoVentaFacturaModalComponent, { backdrop: 'static', size: 'lg' });
    modalRef.componentInstance.idFactura = this.facturaVenta.idFactura;
    const nf = this.facturaVenta.numSerieAfip
      ? HelperService.formatNumFactura(this.facturaVenta.numSerieAfip, this.facturaVenta.numFacturaAfip)
      : HelperService.formatNumFactura(this.facturaVenta.numSerie, this.facturaVenta.numFactura)
    ;
    modalRef.componentInstance.title = [
      this.facturaVenta.tipoComprobante.toString().replace('_', ' '),
      'Nº ' + nf + ' del Cliente ' + this.facturaVenta.nombreFiscalCliente,
      'con fecha ' + this.datePipe.transform(this.facturaVenta.fecha, 'dd/MM/yyyy')
    ].join(' ');
    modalRef.result.then((data: [NuevaNotaCreditoDeFactura, NotaCredito]) => {
      const modalRef2 = this.modalService.open(NotaCreditoVentaDetalleFacturaModalComponent, { backdrop: 'static', size: 'lg' });
      modalRef2.componentInstance.nncf = data[0];
      modalRef2.componentInstance.notaCredito = data[1];
      modalRef2.componentInstance.idCliente = this.facturaVenta.idCliente;
      modalRef2.result.then(
        async (nota: NotaCredito) => {
          const message = 'Nota de Crédito creada correctamente.';
          if (nota.idNota) {
            await this.mensajeService.msg(message, MensajeModalType.INFO).then(
              () => {
                if (this.tiposDeComprobantesParaAutorizacion.indexOf(nota.tipoComprobante) >= 0) {
                  this.doAutorizar(nota.idNota, () => this.afterAutorizar.emit());
                } else { this.afterNoAutorizar.emit() }
              }
            );
          } else {
            throw new Error('La Nota no posee id');
          }
        },
        () => { return; }
      );
    }, () => { return; });
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
                  await this.mensajeService.msg('La Nota fue autorizada por AFIP correctamente!', MensajeModalType.INFO);
                  callback();
                },
                error: async err => {
                  await this.mensajeService.msg(err.error, MensajeModalType.ERROR);
                  callback();
                },
              })
            ;
          } else {
            await this.mensajeService.msg('La funcionalidad de Factura Electronica no se encuentra habilitada.', MensajeModalType.ERROR);
          }
        },
        error: async err => { await this.mensajeService.msg(err.error, MensajeModalType.ERROR) },
      })
    ;
  }
}
