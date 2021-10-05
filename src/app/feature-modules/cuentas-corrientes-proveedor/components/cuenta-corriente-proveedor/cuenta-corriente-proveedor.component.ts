import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {Location} from '@angular/common';
import {CuentasCorrientesService} from '../../../../services/cuentas-corrientes.service';
import {finalize} from 'rxjs/operators';
import {CuentaCorrienteProveedor} from '../../../../models/cuenta-corriente';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';
import {combineLatest, Observable} from 'rxjs';
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

@Component({
  selector: 'app-cuenta-corriente-proveedor',
  templateUrl: './cuenta-corriente-proveedor.component.html',
  styleUrls: ['./cuenta-corriente-proveedor.component.scss']
})
export class CuentaCorrienteProveedorComponent implements OnInit {
  ccp: CuentaCorrienteProveedor;
  renglones: RenglonCuentaCorriente[] = [];
  saldo = 0;

  displayPage = 1;
  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  helper = HelperService;

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR ];
  hasRoleToDelete = false;

  allowedRolesToCrearNota: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO ];
  hasRoleToCrearNota = false;

  allowedRolesToVerDetalle: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO/*, Rol.VENDEDOR*/ ];
  hasRoleToVerDetalle = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              public loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private location: Location,
              private cuentasCorrientesService: CuentasCorrientesService,
              private modalService: NgbModal,
              private authService: AuthService,
              private notasService: NotasService) { }

  ngOnInit(): void {
    if (this.route.snapshot.paramMap.has('id')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loadingOverlayService.activate();
      this.cuentasCorrientesService.getCuentaCorrienteProveedoer(id)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: (ccp: CuentaCorrienteProveedor) => {
            this.ccp = ccp;
            this.getRenglones();
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
  }

  volverAlListado() {
    this.location.back();
  }

  getRenglones() {
    this.loadingOverlayService.activate();

    const obvs = [
      this.cuentasCorrientesService.getCuentaCorrienteProveedorSaldo(this.ccp.proveedor.idProveedor),
      this.cuentasCorrientesService.getCuentaCorrienteRenglones(this.ccp.idCuentaCorriente, this.page)
    ];

    combineLatest(obvs)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (data: [number, Pagination]) => {
          this.saldo = data[0];
          this.renglones = data[1].content;
          this.totalElements = data[1].totalElements;
          this.totalPages = data[1].totalPages;
          this.size = data[1].size;
        },
        error: err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.router.navigate(['/proveedores']);
        }
      })
    ;
  }

  loadPage(page) {
    this.displayPage = page;
    this.page = page - 1;
    this.getRenglones();
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
      return;
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
}
