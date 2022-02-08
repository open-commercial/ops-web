import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CuentasCorrientesService} from '../../services/cuentas-corrientes.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {CuentaCorrienteCliente} from '../../models/cuenta-corriente';
import {MensajeService} from '../../services/mensaje.service';
import {DatePipe, Location} from '@angular/common';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {finalize} from 'rxjs/operators';
import {RenglonCuentaCorriente} from '../../models/renglon-cuenta-corriente';
import {TipoDeComprobante} from '../../models/tipo-de-comprobante';
import {ConfiguracionesSucursalService} from '../../services/configuraciones-sucursal.service';
import {NotasService} from '../../services/notas.service';
import {combineLatest, Observable} from 'rxjs';
import {FacturasVentaService} from '../../services/facturas-venta.service';
import {RecibosService} from '../../services/recibos.service';
import {RemitosService} from '../../services/remitos.service';
import {saveAs} from 'file-saver';
import {BusquedaCuentaCorrienteClienteCriteria} from '../../models/criterias/busqueda-cuenta-corriente-cliente-criteria';
import {OPOption, OptionPickerModalComponent} from '../option-picker-modal/option-picker-modal.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Rol} from '../../models/rol';
import {AuthService} from '../../services/auth.service';
import {Pagination} from '../../models/pagination';
import {NotaCreditoVentaSinFacturaModalComponent} from '../nota-credito-venta-sin-factura-modal/nota-credito-venta-sin-factura-modal.component';
import {Nota, NotaCredito, NotaDebito} from '../../models/nota';
import {NotaCreditoVentaDetalleSinFacturaModalComponent} from '../nota-credito-venta-detalle-sin-factura-modal/nota-credito-venta-detalle-sin-factura-modal.component';
import {NotaDebitoVentaSinReciboModalComponent} from '../nota-debito-venta-sin-recibo-modal/nota-debito-venta-sin-recibo-modal.component';
import {NuevaNotaCreditoSinFactura} from '../../models/nueva-nota-credito-sin-factura';
import {NuevaNotaCreditoDeFactura} from '../../models/nueva-nota-credito-de-factura';
import {NotaCreditoVentaFacturaModalComponent} from '../nota-credito-venta-factura-modal/nota-credito-venta-factura-modal.component';
import {NotaCreditoVentaDetalleFacturaModalComponent} from '../nota-credito-venta-detalle-factura-modal/nota-credito-venta-detalle-factura-modal.component';
import {NuevaNotaDebitoSinRecibo} from '../../models/nueva-nota-debito-sin-recibo';
import {NotaDebitoVentaReciboModalComponent} from '../nota-debito-venta-recibo-modal/nota-debito-venta-recibo-modal.component';
import {NuevaNotaDebitoDeRecibo} from '../../models/nueva-nota-debito-de-recibo';
import {NotaDebitoVentaDetalleSinReciboModalComponent} from '../nota-debito-venta-detalle-sin-recibo-modal/nota-debito-venta-detalle-sin-recibo-modal.component';
import {NotaDebitoVentaDetalleReciboModalComponent} from '../nota-debito-venta-detalle-recibo-modal/nota-debito-venta-detalle-recibo-modal.component';
import {HelperService} from '../../services/helper.service';
import {SucursalesService} from '../../services/sucursales.service';
import {ReciboClienteModalComponent} from '../recibo-cliente-modal/recibo-cliente-modal.component';

@Component({
  selector: 'app-cuenta-corriente-cliente',
  templateUrl: './cuenta-corriente-cliente.component.html',
  styleUrls: ['./cuenta-corriente-cliente.component.scss'],
  providers: [DatePipe]
})
export class CuentaCorrienteClienteComponent implements OnInit {

  ccc: CuentaCorrienteCliente;
  renglones: RenglonCuentaCorriente[] = [];
  saldo = 0;

  displayPage = 1;
  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  tc = TipoDeComprobante;

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR ];
  hasRoleToDelete = false;

  allowedRolesToAutorizar: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRoleToAutorizar = false;

  allowedRolesToVerDetalle: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRoleToVerDetalle = false;

  allowedRolesToCrearNota: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToCrearNota = false;

  allowedRolesToCrearRecibo: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToCrearRecibo = false;

  tcParaNotasDeCredito: TipoDeComprobante[] = [
    TipoDeComprobante.FACTURA_A,
    TipoDeComprobante.FACTURA_B,
    TipoDeComprobante.FACTURA_C,
    TipoDeComprobante.FACTURA_X,
    TipoDeComprobante.FACTURA_Y,
    TipoDeComprobante.PRESUPUESTO,
  ];

  tcParaNotasDeDebito: TipoDeComprobante[] = [
    TipoDeComprobante.RECIBO,
  ];

  tiposDeComprobantesParaAutorizacion: TipoDeComprobante[] = [
    TipoDeComprobante.NOTA_CREDITO_A,
    TipoDeComprobante.NOTA_CREDITO_B,
    TipoDeComprobante.NOTA_CREDITO_C,
    TipoDeComprobante.NOTA_DEBITO_A,
    TipoDeComprobante.NOTA_DEBITO_B,
    TipoDeComprobante.NOTA_DEBITO_C,
  ];

  helper = HelperService;

  constructor(private route: ActivatedRoute,
              private router: Router,
              public loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private location: Location,
              private cuentasCorrientesService: CuentasCorrientesService,
              private configuracionesSucursalService: ConfiguracionesSucursalService,
              private notasService: NotasService,
              private facturasVentaService: FacturasVentaService,
              private recibosService: RecibosService,
              private remitosService: RemitosService,
              private modalService: NgbModal,
              private authService: AuthService,
              private datePipe: DatePipe,
              private sucursalesService: SucursalesService) { }

  ngOnInit() {
    if (this.route.snapshot.paramMap.has('id')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loadingOverlayService.activate();
      this.cuentasCorrientesService.getCuentaCorrienteCliente(id)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          ccc => {
            this.ccc = ccc;
            this.getRenglones();
          },
          err => {
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            this.router.navigate(['/clientes']);
          },
        )
      ;
    } else {
      this.mensajeService.msg('Se debe especificar un id de cliente.', MensajeModalType.ERROR);
      this.router.navigate(['/clientes']);
    }
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    this.hasRoleToAutorizar = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToAutorizar);
    this.hasRoleToVerDetalle = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToVerDetalle);
    this.hasRoleToCrearNota = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCrearNota);
    this.hasRoleToCrearRecibo = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCrearRecibo);
  }

  getRenglones() {
    this.loadingOverlayService.activate();

    const obvs = [
      this.cuentasCorrientesService.getCuentaCorrienteClienteSaldo(this.ccc.cliente.idCliente),
      this.cuentasCorrientesService.getCuentaCorrienteRenglones(this.ccc.idCuentaCorriente, this.page)
    ];

    // this.cuentasCorrientesService.getCuentaCorrienteRenglones(this.ccc.idCuentaCorriente, this.page)
    combineLatest(obvs)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (data: [number, Pagination]) => {
          this.saldo = data[0];
          this.renglones = data[1].content;
          this.totalElements = data[1].totalElements;
          this.totalPages = data[1].totalPages;
          this.size = data[1].size;
        },
        err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.router.navigate(['/clientes']);
        }
      )
    ;
  }

  volverAlListado() {
    this.location.back();
  }

  loadPage(page) {
    this.displayPage = page;
    this.page = page - 1;
    this.getRenglones();
  }

  autorizar(r: RenglonCuentaCorriente) {
    if (!this.hasRoleToAutorizar) {
      this.mensajeService.msg('No posee permiso para autorizar movimientos', MensajeModalType.ERROR);
      return;
    }

    if (this.tiposDeComprobantesParaAutorizacion.indexOf(r.tipoComprobante) < 0) {
      this.mensajeService.msg('El tipo de movimiento seleccionado no corresponde con la operación solicitada.', MensajeModalType.ERROR);
      return;
    }

    this.doAutorizar(r.idMovimiento);
  }

  doAutorizar(idMovimiento: number, callback = () => { return; }) {
    this.loadingOverlayService.activate();
    this.configuracionesSucursalService.isFacturaElectronicaHabilitada()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        habilitada => {
          if (habilitada) {
            this.loadingOverlayService.activate();
            this.notasService.autorizar(idMovimiento)
              .pipe(finalize(() => this.loadingOverlayService.deactivate()))
              .subscribe(
                () => this.mensajeService.msg('La Nota fue autorizada por AFIP correctamente!', MensajeModalType.INFO)
                  .then(() => callback()),
                err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
                  .then(() => callback()),
              )
            ;
          } else {
            this.mensajeService.msg('La funcionalidad de Factura Electronica no se encuentra habilitada.', MensajeModalType.ERROR);
          }
        },
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      );
  }

  verDetalle(r: RenglonCuentaCorriente) {
    if (!this.hasRoleToVerDetalle) {
      this.mensajeService.msg('No posee permiso para ver el detalle de movimientos', MensajeModalType.ERROR);
      return;
    }

    const notasDeDebito: TipoDeComprobante[] = [
      TipoDeComprobante.NOTA_DEBITO_A, TipoDeComprobante.NOTA_DEBITO_B, TipoDeComprobante.NOTA_DEBITO_C,
      TipoDeComprobante.NOTA_DEBITO_PRESUPUESTO, TipoDeComprobante.NOTA_DEBITO_X, TipoDeComprobante.NOTA_DEBITO_Y,
    ];

    const notasDeCredito: TipoDeComprobante[] = [
      TipoDeComprobante.NOTA_CREDITO_A, TipoDeComprobante.NOTA_CREDITO_B, TipoDeComprobante.NOTA_CREDITO_C,
      TipoDeComprobante.NOTA_CREDITO_PRESUPUESTO, TipoDeComprobante.NOTA_CREDITO_X, TipoDeComprobante.NOTA_CREDITO_Y,
    ];

    const facturas: TipoDeComprobante[] = [
      TipoDeComprobante.FACTURA_A,
      TipoDeComprobante.FACTURA_B,
      TipoDeComprobante.FACTURA_C,
      TipoDeComprobante.FACTURA_X,
      TipoDeComprobante.FACTURA_Y,
      TipoDeComprobante.PRESUPUESTO,
    ];

    let nombreArchivo = '';
    let obvs: Observable<Blob> = null;

    if (notasDeDebito.indexOf(r.tipoComprobante) >= 0) {
      this.router.navigate(['/notas-debito-venta/ver', r.idMovimiento]);
      return;
    }

    if (notasDeCredito.indexOf(r.tipoComprobante) >= 0) {
      this.router.navigate(['/notas-credito-venta/ver', r.idMovimiento]);
      return;
    }

    if (facturas.indexOf(r.tipoComprobante) >= 0) {
      nombreArchivo = 'Factura.pdf';
      obvs = this.facturasVentaService.getFacturaPdf(r.idMovimiento);
    }

    if (r.tipoComprobante === TipoDeComprobante.RECIBO) {
      nombreArchivo = 'Recibo.pdf';
      obvs = this.recibosService.getReporteRecibo(r.idMovimiento);
    }

    if (r.tipoComprobante === TipoDeComprobante.REMITO) {
      nombreArchivo = 'Remito.pdf';
      obvs = this.remitosService.getRemitoPdf(r.idMovimiento);
    }

    if (nombreArchivo && obvs) {
      this.loadingOverlayService.activate();
      obvs
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          (res) => {
            const file = new Blob([res], {type: 'application/pdf'});
            saveAs(file, nombreArchivo);
          },
          () => this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR),
        )
      ;
    }
  }

  exportar() {
    if (this.ccc && this.ccc.cliente && this.ccc.cliente) {
      const options: OPOption[] = [{ value: 'xlsx', text: 'Excel'}, { value: 'pdf', text: 'Pdf' }];
      const modalRef = this.modalService.open(OptionPickerModalComponent);
      modalRef.componentInstance.options = options;
      modalRef.componentInstance.title = 'Formato';
      modalRef.componentInstance.label = 'Seleccione un formato:';
      modalRef.result.then(formato => {
        const criteria: BusquedaCuentaCorrienteClienteCriteria = {
          idCliente: this.ccc.cliente.idCliente,
          pagina: 0,
        };
        this.loadingOverlayService.activate();
        this.cuentasCorrientesService.getReporte(criteria, formato)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe(
            (res) => {
              const mimeType = formato === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf';
              const file = new Blob([res], {type: mimeType});
              saveAs(file, `CuentaCorrienteCliente.${formato}`);
            },
            () => this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR),
          )
        ;
      });
    }
  }

  eliminar(r: RenglonCuentaCorriente) {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('No posee permiso para eliminar movimientos', MensajeModalType.ERROR);
      return;
    }

    const notas: TipoDeComprobante[] = [
      TipoDeComprobante.NOTA_CREDITO_A, TipoDeComprobante.NOTA_CREDITO_B, TipoDeComprobante.NOTA_CREDITO_C,
      TipoDeComprobante.NOTA_CREDITO_X, TipoDeComprobante.NOTA_CREDITO_Y, TipoDeComprobante.NOTA_CREDITO_PRESUPUESTO,
      TipoDeComprobante.NOTA_DEBITO_A, TipoDeComprobante.NOTA_DEBITO_B, TipoDeComprobante.NOTA_DEBITO_C,
      TipoDeComprobante.NOTA_DEBITO_X, TipoDeComprobante.NOTA_DEBITO_Y, TipoDeComprobante.NOTA_DEBITO_PRESUPUESTO,
    ];

    let obvs: Observable<void> = null;
    if (notas.indexOf(r.tipoComprobante) >= 0) {
      obvs = this.notasService.eliminar(r.idMovimiento);
    }
    if (r.tipoComprobante === TipoDeComprobante.REMITO) {
      obvs = this.remitosService.eliminarRemito(r.idMovimiento);
    }
    if (r.tipoComprobante === TipoDeComprobante.RECIBO) {
      obvs = this.recibosService.eliminarRecibo(r.idMovimiento);
    }

    if (obvs) {
      const msg = 'Esta seguro que desea eliminar / anular el movimiento seleccionado?';
      this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
        if (result) {
          this.loadingOverlayService.activate();
          obvs
            .pipe(finalize(() => this.loadingOverlayService.deactivate()))
            .subscribe(
              () => this.loadPage(this.page + 1),
              err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
            )
          ;
        }
      });
    } else {
      this.mensajeService.msg('La operación no aplica para el movimiento seleccionado.', MensajeModalType.INFO);
    }
  }

  nuevaNotaCredito() {
    if (!this.hasRoleToCrearNota) {
      this.mensajeService.msg('No posee permiso para crear notas.', MensajeModalType.ERROR);
      return;
    }

    const modalRef = this.modalService.open(NotaCreditoVentaSinFacturaModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.cliente = this.ccc.cliente;
    modalRef.result
      .then((data: [NuevaNotaCreditoSinFactura, NotaCredito]) => {
        const modalRef2 = this.modalService.open(NotaCreditoVentaDetalleSinFacturaModalComponent, {backdrop: 'static', size: 'lg'});
        modalRef2.componentInstance.nncsf = data[0];
        modalRef2.componentInstance.notaCredito = data[1];
        modalRef2.componentInstance.cliente = this.ccc.cliente;
        modalRef2.result.then(
          (nota: NotaCredito) => this.showNotaCreationSuccessMessage(nota, 'Nota de Crédito creada correctamente.'),
          () => { return; }
        );
      }, () => { return; })
    ;
  }

  nuevaNotaDebito() {
    if (!this.hasRoleToCrearNota) {
      this.mensajeService.msg('No posee permiso para crear notas.', MensajeModalType.ERROR);
      return;
    }

    const modalRef = this.modalService.open(NotaDebitoVentaSinReciboModalComponent, { backdrop: 'static' });
    modalRef.componentInstance.cliente = this.ccc.cliente;
    modalRef.result
      .then((data: [NuevaNotaDebitoSinRecibo, NotaDebito]) => {
        const modalRef2 = this.modalService.open(NotaDebitoVentaDetalleSinReciboModalComponent, { backdrop: 'static', size: 'lg' });
        modalRef2.componentInstance.nndsr = data[0];
        modalRef2.componentInstance.notaDebito = data[1];
        modalRef2.componentInstance.cliente = this.ccc.cliente;
        modalRef2.result.then(
          (nota: NotaDebito) => this.showNotaCreationSuccessMessage(nota, 'Nota de Débito creada correctamente.'),
          () => { return; }
        );
      }, () => { return; })
    ;
  }

  crearNotaCreditoFactura(r: RenglonCuentaCorriente) {
    if (this.tcParaNotasDeCredito.indexOf(r.tipoComprobante) < 0) {
      this.mensajeService.msg('La operación no es aplicable al tipo de comprobante.', MensajeModalType.ERROR);
      return;
    }

    if (!this.hasRoleToCrearNota) {
      this.mensajeService.msg('No posee permiso para crear notas.', MensajeModalType.ERROR);
      return;
    }

    if (r.idSucursal !== this.sucursalesService.getIdSucursal()) {
      this.mensajeService.msg('La factura seleccionada fue emitida en otra sucursal. ¿Desea continuar?', MensajeModalType.CONFIRM)
        .then((result) => {
          if (result) {
            this.doCrearNotaCreditoFactura(r);
          }
        })
      ;
    } else {
      this.doCrearNotaCreditoFactura(r);
    }
  }

  doCrearNotaCreditoFactura(r: RenglonCuentaCorriente) {
    const modalRef = this.modalService.open(NotaCreditoVentaFacturaModalComponent, { backdrop: 'static', size: 'lg' });
    modalRef.componentInstance.idFactura = r.idMovimiento;
    modalRef.componentInstance.title = [
      r.tipoComprobante.toString().replace('_', ' '),
      'Nº ' + r.serie + '-' + r.numero,
      'del Cliente ' + this.ccc.cliente.nombreFiscal,
      'con fecha ' + this.datePipe.transform(r.fecha, 'dd/MM/yyyy')
    ].join(' ');
    modalRef.result.then((data: [NuevaNotaCreditoDeFactura, NotaCredito]) => {
      const modalRef2 = this.modalService.open(NotaCreditoVentaDetalleFacturaModalComponent, { backdrop: 'static', size: 'lg' });
      modalRef2.componentInstance.nncf = data[0];
      modalRef2.componentInstance.notaCredito = data[1];
      modalRef2.componentInstance.cliente = this.ccc.cliente;
      modalRef2.result.then(
        (nota: NotaCredito) => this.showNotaCreationSuccessMessage(nota, 'Nota de Crédito creada correctamente.'),
        () => { return; }
      );
    }, () => { return; });
  }

  crearNotaDebitoRecibo(r: RenglonCuentaCorriente) {
    if (this.tcParaNotasDeDebito.indexOf(r.tipoComprobante) < 0) {
      this.mensajeService.msg('La operación no es aplicable al tipo de comprobante.', MensajeModalType.ERROR);
      return;
    }

    if (!this.hasRoleToCrearNota) {
      this.mensajeService.msg('No posee permiso para crear notas.', MensajeModalType.ERROR);
      return;
    }

    if (r.idSucursal !== this.sucursalesService.getIdSucursal()) {
      this.mensajeService.msg('El recibo seleccionado fue emitido en otra sucursal. ¿Desea continuar?', MensajeModalType.CONFIRM)
        .then((result) => {
          if (result) {
            this.doCrearNotaDebitoRecibo(r);
          }
        })
      ;
    } else {
      this.doCrearNotaDebitoRecibo(r);
    }
  }

  doCrearNotaDebitoRecibo(r: RenglonCuentaCorriente) {
    const modalRef = this.modalService.open(NotaDebitoVentaReciboModalComponent, { backdrop: 'static' });
    modalRef.componentInstance.cliente = this.ccc.cliente;
    modalRef.componentInstance.idRecibo = r.idMovimiento;
    modalRef.result
      .then((data: [NuevaNotaDebitoDeRecibo, NotaDebito]) => {
        const modalRef2 = this.modalService.open(NotaDebitoVentaDetalleReciboModalComponent, { backdrop: 'static', size: 'lg' });
        modalRef2.componentInstance.nnddr = data[0];
        modalRef2.componentInstance.notaDebito = data[1];
        modalRef2.componentInstance.cliente = this.ccc.cliente;
        modalRef2.result.then(
          (nota: NotaDebito) => this.showNotaCreationSuccessMessage(nota, 'Nota de Débito creada correctamente.'),
          () => { return; }
        );
      }, () => { return; })
    ;
  }

  private showNotaCreationSuccessMessage(nota: Nota, message: string) {
    if (nota.idNota) {
      this.mensajeService.msg(message, MensajeModalType.INFO).then(
        () => {
          if (this.tiposDeComprobantesParaAutorizacion.indexOf(nota.tipoComprobante) >= 0) {
            this.doAutorizar(nota.idNota, () => this.loadPage(1));
          } else {
            this.loadPage(1);
          }
        }
      );
    } else {
      throw new Error('La Nota no posee id');
    }
  }

  nuevoRecibo() {
    if (!this.hasRoleToCrearRecibo) {
      this.mensajeService.msg('No posee permiso para crear recibos.', MensajeModalType.ERROR);
      return;
    }

    const modalRef = this.modalService.open(ReciboClienteModalComponent, { backdrop: 'static' });
    const saldo = (this.ccc.saldo < 0 ? Number(this.ccc.saldo.toFixed(2).replace(',', '')) : 0) * -1;
    modalRef.componentInstance.cliente = this.ccc.cliente;
    modalRef.componentInstance.saldo = saldo;
    modalRef.result.then(() => this.loadPage(1), () => { return; });
  }
}
