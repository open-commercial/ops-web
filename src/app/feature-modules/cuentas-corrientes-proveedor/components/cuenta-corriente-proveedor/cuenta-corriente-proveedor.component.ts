import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {DatePipe, Location} from '@angular/common';
import {CuentasCorrientesService} from '../../../../services/cuentas-corrientes.service';
import {finalize} from 'rxjs/operators';
import {CuentaCorrienteProveedor} from '../../../../models/cuenta-corriente';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';
import {Observable} from 'rxjs';
import {Pagination} from '../../../../models/pagination';
import {RenglonCuentaCorriente} from '../../../../models/renglon-cuenta-corriente';
import {HelperService} from '../../../../services/helper.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NotaCreditoCompraSinFacturaModalComponent} from '../nota-credito-compra-sin-factura-modal/nota-credito-compra-sin-factura-modal.component';
import {NuevaNotaCreditoSinFactura} from '../../../../models/nueva-nota-credito-sin-factura';
import {Nota, NotaCredito, NotaDebito} from '../../../../models/nota';
import {NotaCreditoCompraDetalleSinFacturaModalComponent} from '../nota-credito-compra-detalle-sin-factura-modal/nota-credito-compra-detalle -sin-factura-modal.component';
import {TipoDeComprobante} from '../../../../models/tipo-de-comprobante';
import {Rol} from '../../../../models/rol';
import {AuthService} from '../../../../services/auth.service';
import {NotasService} from '../../../../services/notas.service';
import {
  NotaDebitoCompraSinReciboModalComponent
} from '../nota-debito-compra-sin-recibo-modal/nota-debito-compra-sin-recibo-modal.component';
import {NuevaNotaDebitoSinRecibo} from '../../../../models/nueva-nota-debito-sin-recibo';
import {NotaDebitoCompraDetalleSinReciboModalComponent} from '../nota-debito-compra-detalle-sin-recibo-modal/nota-debito-compra-detalle-sin-recibo-modal.component';
import {NotaCreditoCompraFacturaModalComponent} from '../nota-credito-compra-factura-modal/nota-credito-compra-factura-modal.component';
import {NuevaNotaCreditoDeFactura} from '../../../../models/nueva-nota-credito-de-factura';
import {NotaCreditoCompraDetalleFacturaModalComponent} from '../nota-credito-compra-detalle-factura-modal/nota-credito-compra-detalle-factura-modal.component';
import {NotaDebitoCompraReciboModalComponent} from '../nota-debito-compra-recibo-modal/nota-debito-compra-recibo-modal.component';
import {NuevaNotaDebitoDeRecibo} from '../../../../models/nueva-nota-debito-de-recibo';
import {NotaDebitoCompraDetalleReciboModalComponent} from '../nota-debito-compra-detalle-recibo-modal/nota-debito-compra-detalle-recibo-modal.component';
import {ReciboProveedorModalComponent} from '../../../../components/recibo-proveedor-modal/recibo-proveedor-modal.component';
import {RecibosService} from '../../../../services/recibos.service';
import { ListadoDirective } from 'src/app/directives/listado.directive';
import { SucursalesService } from 'src/app/services/sucursales.service';

@Component({
  selector: 'app-cuenta-corriente-proveedor',
  templateUrl: './cuenta-corriente-proveedor.component.html',
  styleUrls: ['./cuenta-corriente-proveedor.component.scss'],
  providers: [DatePipe]
})
export class CuentaCorrienteProveedorComponent extends ListadoDirective implements OnInit {
  ccp: CuentaCorrienteProveedor;
  renglones: RenglonCuentaCorriente[] = [];
  saldo = 0;

  displayPage = 1;

  helper = HelperService;

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR ];
  hasRoleToDelete = false;

  allowedRolesToCrearNota: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToCrearNota = false;

  allowedRolesToVerDetalle: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO/*, Rol.VENDEDOR*/ ];
  hasRoleToVerDetalle = false;

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

  comprobantesQuePuedenEliminarse: TipoDeComprobante[] = [
    TipoDeComprobante.NOTA_CREDITO_A, TipoDeComprobante.NOTA_CREDITO_B, TipoDeComprobante.NOTA_CREDITO_C,
    TipoDeComprobante.NOTA_CREDITO_X, TipoDeComprobante.NOTA_CREDITO_Y, TipoDeComprobante.NOTA_CREDITO_PRESUPUESTO,
    TipoDeComprobante.NOTA_DEBITO_A, TipoDeComprobante.NOTA_DEBITO_B, TipoDeComprobante.NOTA_DEBITO_C,
    TipoDeComprobante.NOTA_DEBITO_X, TipoDeComprobante.NOTA_DEBITO_Y, TipoDeComprobante.NOTA_DEBITO_PRESUPUESTO,
    TipoDeComprobante.RECIBO
  ];

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              private location: Location,
              private cuentasCorrientesService: CuentasCorrientesService,
              private modalService: NgbModal,
              private authService: AuthService,
              private notasService: NotasService,
              private recibosService: RecibosService,
              private datePipe: DatePipe) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  ngOnInit(): void {
    if (this.route.snapshot.paramMap.has('id')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loadingOverlayService.activate();
      this.cuentasCorrientesService.getCuentaCorrienteProveedoer(id)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: (ccp: CuentaCorrienteProveedor) => {
            this.ccp = ccp;
            super.ngOnInit();
            this.loadingOverlayService.activate();
            this.cuentasCorrientesService.getCuentaCorrienteProveedorSaldo(this.ccp.proveedor.idProveedor)
              .pipe(finalize(() => this.loadingOverlayService.deactivate()))
              .subscribe({
                next: saldo => this.saldo = saldo,
                error: err => {
                  this.mensajeService.msg(err.error, MensajeModalType.ERROR)
                    .then(() => { return; }, () => { return; });
                  this.router.navigate(['/proveedores']);
                }
              })
            ;
          },
          error: (err) => {
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            this.router.navigate(['/proveedores']);
          }
        })
      ;
    } else {
      this.mensajeService.msg('Se debe especificar un id de proveedor.', MensajeModalType.ERROR);
      this.router.navigate(['/proveedores']);
    }
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    this.hasRoleToCrearNota = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCrearNota);
    this.hasRoleToVerDetalle = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToVerDetalle);
    this.hasRoleToCrearRecibo = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCrearRecibo);
  }

  volverAlListado() {
    this.location.back();
  }

  getItemsFromQueryParams(params = null) {
    super.getItemsFromQueryParams(params);
    this.displayPage = this.page + 1;
  }

  loadPage(page) {
    this.page = page - 1;
    const qParams = this.getFormValues() as { [key: string]: any };
    qParams.p = this.page + 1;
    this.router.navigate([], { relativeTo: this.route, queryParams: qParams });
  }

  populateFilterForm(params) {
    /*No hace nada ya que no existe formulario de filtro */
  }

  getTerminosFromQueryParams(params) {
    return {
      pagina: this.page,
    };
  }

  createFilterForm() { /* No hace nada ya que no existe formulario de filtro */ }
  resetFilterForm() { /* No hace nada ya que no existe formulario de filtro */ }

  getAppliedFilters() { this.appliedFilters = []; };
  getFormValues() { return {} };

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.cuentasCorrientesService.getCuentaCorrienteRenglones(this.ccp.idCuentaCorriente, terminos.pagina)
  }

  nuevaNotaCredito() {
    if (!this.hasRoleToCrearNota) {
      this.mensajeService.msg('No posee permiso para crear notas.', MensajeModalType.ERROR);
      return;
    }

    const modalRef = this.modalService.open(NotaCreditoCompraSinFacturaModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.proveedor = this.ccp.proveedor;
    modalRef.result.then((data: [NuevaNotaCreditoSinFactura, NotaCredito]) => {
      const modalRef2 = this.modalService.open(NotaCreditoCompraDetalleSinFacturaModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef2.componentInstance.proveedor = this.ccp.proveedor;
      modalRef2.componentInstance.notaCredito = data[1];
      modalRef2.componentInstance.nncsf = data[0];
      modalRef2.result.then(
        (nota: NotaCredito) => this.showNotaCreationSuccessMessage(nota, 'Nota de Crédito creada correctamente.'),
        () => { return; }
      );
    }, () => { return; });
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
    this.doCrearNotaCreditoFactura(r);
  }

  doCrearNotaCreditoFactura(r: RenglonCuentaCorriente) {
    const modalRef = this.modalService.open(NotaCreditoCompraFacturaModalComponent, { backdrop: 'static', size: 'lg' });
    modalRef.componentInstance.idFactura = r.idMovimiento;
    modalRef.componentInstance.title = [
      r.tipoComprobante.toString().replace('_', ' '),
      'Nº ' + r.serie + '-' + r.numero,
      'del Proveedor ' + this.ccp.proveedor.razonSocial,
      'con fecha ' + this.datePipe.transform(r.fecha, 'dd/MM/yyyy')
    ].join(' ');
    modalRef.result.then((data: [NuevaNotaCreditoDeFactura, NotaCredito]) => {
      const modalRef2 = this.modalService.open(NotaCreditoCompraDetalleFacturaModalComponent, { backdrop: 'static', size: 'lg' });
      modalRef2.componentInstance.nncf = data[0];
      modalRef2.componentInstance.notaCredito = data[1];
      modalRef2.componentInstance.proveedor = this.ccp.proveedor;
      modalRef2.result.then(
        (nota: NotaCredito) => this.showNotaCreationSuccessMessage(nota, 'Nota de Crédito creada correctamente.'),
        () => { return; }
      );
    }, () => { return; });
  }

  nuevaNotaDebito() {
    if (!this.hasRoleToCrearNota) {
      this.mensajeService.msg('No posee permiso para crear notas.', MensajeModalType.ERROR);
      return;
    }

    const modalRef = this.modalService.open(NotaDebitoCompraSinReciboModalComponent, { backdrop: 'static' });
    modalRef.componentInstance.proveedor = this.ccp.proveedor;
    modalRef.result
      .then((data: [NuevaNotaDebitoSinRecibo, NotaDebito]) => {
        const modalRef2 = this.modalService.open(NotaDebitoCompraDetalleSinReciboModalComponent, {backdrop: 'static', size: 'lg'});
        modalRef2.componentInstance.proveedor = this.ccp.proveedor;
        modalRef2.componentInstance.notaDebito = data[1];
        modalRef2.componentInstance.nndsr = data[0];
        modalRef2.result.then(
          (nota: NotaDebito) => this.showNotaCreationSuccessMessage(nota, 'Nota de Débito creada correctamente.'),
          () => { return; }
        );
      }, () => { return; })
    ;
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

    this.doCrearNotaDebitoRecibo(r);
  }

  doCrearNotaDebitoRecibo(r: RenglonCuentaCorriente) {
    const modalRef = this.modalService.open(NotaDebitoCompraReciboModalComponent, { backdrop: 'static' });
    modalRef.componentInstance.proveedor = this.ccp.proveedor;
    modalRef.componentInstance.idRecibo = r.idMovimiento;
    modalRef.result.then((data: [NuevaNotaDebitoDeRecibo, NotaDebito]) => {
      const modalRef2 = this.modalService.open(NotaDebitoCompraDetalleReciboModalComponent, { backdrop: 'static'});
      modalRef2.componentInstance.nndr = data[0];
      modalRef2.componentInstance.notaDebito = data[1];
      modalRef2.componentInstance.proveedor = this.ccp.proveedor;
      modalRef2.result.then(
        (nota: NotaDebito) => this.showNotaCreationSuccessMessage(nota, 'Nota de Débito creada correctamente.'),
        () => { return; }
      );
    }, () => { return; });
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

    if (notasDeDebito.indexOf(r.tipoComprobante) >= 0) {
      this.router.navigate(['/notas-debito-compra/ver', r.idMovimiento]);
      return;
    }

    if (notasDeCredito.indexOf(r.tipoComprobante) >= 0) {
      this.router.navigate(['/notas-credito-compra/ver', r.idMovimiento]);
      return;
    }

    if (facturas.indexOf(r.tipoComprobante) >= 0) {
      this.router.navigate(['/facturas-compra/ver', r.idMovimiento]);
      return;
    }

    if (r.tipoComprobante === TipoDeComprobante.RECIBO) {
      this.router.navigate(['/recibos/ver', r.idMovimiento]);
    }
  }

  elComprobanteSePuedeEliminar(tipoComprobante: TipoDeComprobante): boolean {
    return this.comprobantesQuePuedenEliminarse.indexOf(tipoComprobante) >= 0;
  }

  eliminar(r: RenglonCuentaCorriente) {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('No posee permiso para eliminar movimientos', MensajeModalType.ERROR);
      return;
    }

    let obvs: Observable<void> = null;
    if (this.elComprobanteSePuedeEliminar(r.tipoComprobante)) {
      if (r.tipoComprobante === TipoDeComprobante.RECIBO) {
        obvs = this.recibosService.eliminarRecibo(r.idMovimiento);
      } else {
        obvs = this.notasService.eliminar(r.idMovimiento);
      }
    }

    if (obvs) {
      const msg = 'Esta seguro que desea eliminar / anular el movimiento seleccionado?';
      this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
        if (result) {
          this.loadingOverlayService.activate();
          obvs
            .pipe(finalize(() => this.loadingOverlayService.deactivate()))
            .subscribe({
              next: () => this.loadPage(this.page + 1),
              error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
            })
          ;
        }
      });
    }
  }

  private showNotaCreationSuccessMessage(nota: Nota, message: string) {
    if (nota.idNota) {
      this.mensajeService.msg(message, MensajeModalType.INFO).then(() => this.loadPage(1));
    } else {
      throw new Error('La Nota no posee id');
    }
  }

  nuevoRecibo() {
    if (!this.hasRoleToCrearRecibo) {
      this.mensajeService.msg('No posee permiso para crear recibos.', MensajeModalType.ERROR);
      return;
    }

    const modalRef = this.modalService.open(ReciboProveedorModalComponent, { backdrop: 'static' });
    const saldo = (this.saldo < 0 ? Number(this.saldo.toFixed(2).replace(',', '')) : 0) * -1;
    modalRef.componentInstance.proveedor = this.ccp.proveedor;
    modalRef.componentInstance.saldo = saldo;
    modalRef.result.then(() => this.loadPage(1), () => { return; });
  }
}
