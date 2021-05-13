import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CuentasCorrientesService} from '../../services/cuentas-corrientes.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {CuentaCorrienteCliente} from '../../models/cuenta-corriente';
import {MensajeService} from '../../services/mensaje.service';
import {Location} from '@angular/common';
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

@Component({
  selector: 'app-cuenta-corriente-cliente',
  templateUrl: './cuenta-corriente-cliente.component.html',
  styleUrls: ['./cuenta-corriente-cliente.component.scss']
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
  hasRolToDelete = false;

  allowedRolesToAutorizar: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRolToAutorizar = false;

  allowedRolesToVerDetalle: Rol[] = [ Rol.ADMINISTRADOR, Rol.ENCARGADO, Rol.VENDEDOR ];
  hasRolToVerDetalle = false;

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
              private authService: AuthService) { }

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
    this.hasRolToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    this.hasRolToAutorizar = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToAutorizar);
    this.hasRolToVerDetalle = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToVerDetalle);
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
    this.page = page - 1;
    this.getRenglones();
  }

  autorizar(r: RenglonCuentaCorriente) {
    if (!this.hasRolToAutorizar) {
      this.mensajeService.msg('No posee permiso para autorizar movimientos', MensajeModalType.ERROR);
      return;
    }

    const TiposDeComprobantesParaAutorizacion: TipoDeComprobante[] = [
      TipoDeComprobante.NOTA_CREDITO_A,
      TipoDeComprobante.NOTA_CREDITO_B,
      TipoDeComprobante.NOTA_CREDITO_C,
      TipoDeComprobante.NOTA_DEBITO_A,
      TipoDeComprobante.NOTA_DEBITO_B,
      TipoDeComprobante.NOTA_DEBITO_C,
    ];
    if (TiposDeComprobantesParaAutorizacion.indexOf(r.tipoComprobante) < 0) {
      this.mensajeService.msg('El tipo de movimiento seleccionado no corresponde con la operación solicitada.', MensajeModalType.ERROR);
      return;
    }

    this.loadingOverlayService.activate();
    this.configuracionesSucursalService.isFacturaElectronicaHabilitada()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        habilitada => {
          if (habilitada) {
            this.loadingOverlayService.activate();
            this.notasService.autorizar(r.idMovimiento)
              .pipe(finalize(() => this.loadingOverlayService.deactivate()))
              .subscribe(
                () => this.mensajeService.msg('La Nota fue autorizada por AFIP correctamente!', MensajeModalType.INFO),
                err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
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
    if (!this.hasRolToVerDetalle) {
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
      nombreArchivo = 'NotaDebito.pdf';
      obvs = this.notasService.getReporte(r.idMovimiento);
    }

    if (notasDeCredito.indexOf(r.tipoComprobante) >= 0) {
      nombreArchivo = 'NotaCredito.pdf';
      obvs = this.notasService.getReporte(r.idMovimiento);
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
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        )
      ;
    }
  }

  eliminar(r: RenglonCuentaCorriente) {
    if (!this.hasRolToDelete) {
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
            }
          )
        ;
      });
    }
  }
}
