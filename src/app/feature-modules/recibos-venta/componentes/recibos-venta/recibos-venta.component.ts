import {Component, OnInit} from '@angular/core';
import {RecibosDirective} from '../../../../directives/recibos.directive';
import {Recibo} from '../../../../models/recibo';
import {Movimiento} from '../../../../models/movimiento';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../../../services/sucursales.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {UntypedFormBuilder, UntypedFormControl} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RecibosService} from '../../../../services/recibos.service';
import {FormasDePagoService} from '../../../../services/formas-de-pago.service';
import {ClientesService} from '../../../../services/clientes.service';
import {UsuariosService} from '../../../../services/usuarios.service';
import {AuthService} from '../../../../services/auth.service';
import {ConfiguracionesSucursalService} from '../../../../services/configuraciones-sucursal.service';
import {NotasService} from '../../../../services/notas.service';
import {Observable} from 'rxjs';
import {Cliente} from '../../../../models/cliente';
import {finalize, map} from 'rxjs/operators';
import {
  NotaDebitoVentaReciboModalComponent
} from '../../../../components/nota-debito-venta-recibo-modal/nota-debito-venta-recibo-modal.component';
import {NuevaNotaDebitoDeRecibo} from '../../../../models/nueva-nota-debito-de-recibo';
import {NotaDebito} from '../../../../models/nota';
import {
  NotaDebitoVentaDetalleReciboModalComponent
} from '../../../../components/nota-debito-venta-detalle-recibo-modal/nota-debito-venta-detalle-recibo-modal.component';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-recibos-venta',
  templateUrl: './recibos-venta.component.html'
})
export class RecibosVentaComponent extends RecibosDirective implements OnInit {
  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected fb: UntypedFormBuilder,
              protected modalService: NgbModal,
              protected recibosService: RecibosService,
              protected formasDePagoService: FormasDePagoService,
              protected usuariosService: UsuariosService,
              protected authService: AuthService,
              protected configuracionesSucursalService: ConfiguracionesSucursalService,
              protected notasService: NotasService,
              private clientesService: ClientesService) {
    super(
      route, router, sucursalesService, loadingOverlayService, mensajeService,
      fb, modalService, recibosService, formasDePagoService, usuariosService,
      authService, configuracionesSucursalService, notasService
    );
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getMovimiento(): Movimiento {
    return Movimiento.VENTA;
  }

  getTerminosFromQueryParams(ps) {
    const terminos = super.getTerminosFromQueryParams(ps);

    if (ps.idCliente && !isNaN(ps.idCliente)) {
      this.filterForm.get('idCliente').setValue(Number(ps.idCliente));
      terminos.idCliente = Number(ps.idCliente);
    }

    return terminos;
  }

  createFilterForm() {
    super.createFilterForm();
    this.filterForm.addControl('idCliente', new UntypedFormControl(null));
  }

  resetFilterForm() {
    super.resetFilterForm();
    this.filterForm.get('idCliente').setValue(null);
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    super.getAppliedFilters();
    if (values.idCliente) {
      this.appliedFilters.push({ label: 'Cliente', value: values.idCliente, asyncFn: this.getClienteInfoAsync(values.idCliente) });
    }
  }

  getClienteInfoAsync(id: number): Observable<string> {
    return this.clientesService.getCliente(id).pipe(map((c: Cliente) => c.nombreFiscal));
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret = super.getFormValues();

    if (values.idCliente) { ret.idCliente = values.idCliente; }

    return ret;
  }

  doCrearNotaDebitoRecibo(r: Recibo) {
    this.loadingOverlayService.activate();
    this.clientesService.getCliente(r.idCliente)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (c: Cliente) => {
          const modalRef = this.modalService.open(NotaDebitoVentaReciboModalComponent, { backdrop: 'static' });
          modalRef.componentInstance.cliente = c;
          modalRef.componentInstance.idRecibo = r.idRecibo;
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
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      });
  }

  doAutorizar(idNota: number, callback = () => { return; }) {
    this.loadingOverlayService.activate();
    this.configuracionesSucursalService.isFacturaElectronicaHabilitada()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: habilitada => {
          if (habilitada) {
            this.loadingOverlayService.activate();
            this.notasService.autorizar(idNota)
              .pipe(finalize(() => this.loadingOverlayService.deactivate()))
              .subscribe({
                next: () => this.mensajeService.msg('La Nota fue autorizada por AFIP correctamente!', MensajeModalType.INFO)
                  .then(() => callback()),
                error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
                  .then(() => callback()),
              })
            ;
          } else {
            this.mensajeService.msg('La funcionalidad de Factura Electronica no se encuentra habilitada.', MensajeModalType.ERROR);
          }
        },
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      });
  }
}
