import { AuthService } from './../../services/auth.service';
import { Rol } from './../../models/rol';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Caja } from '../../models/caja';
import { ActivatedRoute } from '@angular/router';
import { CajasService } from '../../services/cajas.service';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { formatCurrency, Location } from '@angular/common';
import { MensajeService } from '../../services/mensaje.service';
import { finalize } from 'rxjs/operators';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { EstadoCaja } from '../../models/estado-caja';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { FormasDePagoService } from '../../services/formas-de-pago.service';
import { FormaDePago } from '../../models/forma-de-pago';
import { NgbAccordion, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MontoModalComponent } from '../monto-modal/monto-modal.component';
import { NuevoGastoModalComponent } from '../nuevo-gasto-modal/nuevo-gasto-modal.component';
import { SucursalesService } from '../../services/sucursales.service';

@Component({
  selector: 'app-ver-caja',
  templateUrl: './ver-caja.component.html'
})
export class VerCajaComponent implements OnInit, OnDestroy {

  estado = EstadoCaja;
  caja: Caja = null;
  formasDePago: FormaDePago[] = [];
  totalesFormasDePago: { [key: number]: number } = {};
  resumen: { idFormaDePago: number, nombreFormaDePago: string, afectaCaja: boolean, total: number }[] = [];
  totalQueAfectaCaja: number = null;
  totalSistema: number = null;
  loadingTotales = false;
  @ViewChild('accordion') accordion: NgbAccordion;
  subscription: Subscription;
  allowedRolesToDelete: Rol[] = [Rol.ADMINISTRADOR];
  hasRoleToDelete = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly formasDePagoService: FormasDePagoService,
    private readonly cajasService: CajasService,
    private readonly sucursalesService: SucursalesService,
    private readonly location: Location,
    private readonly loadingOverlayService: LoadingOverlayService,
    private readonly mensajeService: MensajeService,
    private readonly modalService: NgbModal,
    private readonly authService: AuthService
  ) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.refreshCaja(id);
    this.subscription.add(this.sucursalesService.sucursalSeleccionada$.subscribe(() => this.volverAlListado()));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  refreshCaja(id = null) {
    id = id ? id : this.caja.idCaja;

    const obs: Observable<any>[] = [
      this.cajasService.getCaja(id),
      this.formasDePagoService.getFormasDePago(),
      this.cajasService.getTotalesFormasDePagoCaja(id),
      this.cajasService.getSaldoQueAfectaCaja(id),
      this.cajasService.getSaldoSistema(id)
    ];

    this.loadingOverlayService.activate();
    this.subscription.add(
      combineLatest(obs)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: (data: [Caja, FormaDePago[], { [key: number]: number }, number, number]) => {
            this.caja = data[0];
            this.formasDePago = data[1];
            this.totalesFormasDePago = data[2];
            this.totalQueAfectaCaja = data[3];
            this.totalSistema = data[4];
            this.generateResumen();
          },
          error: err => {
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            this.volverAlListado();
          }
        })
    );
  }

  refreshTotales() {
    const obs: Observable<any>[] = [
      this.cajasService.getSaldoQueAfectaCaja(this.caja.idCaja),
      this.cajasService.getSaldoSistema(this.caja.idCaja),
    ];

    this.loadingTotales = true;
    this.subscription.add(
      combineLatest(obs)
        .pipe(finalize(() => this.loadingTotales = false))
        .subscribe({
          next: (data: [number, number]) => {
            this.totalQueAfectaCaja = data[0];
            this.totalSistema = data[1];
          },
          error: err => {
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            this.volverAlListado();
          }
        })
    );
  }

  generateResumen() {
    this.resumen = [];
    this.resumen.push({ idFormaDePago: 0, nombreFormaDePago: 'Saldo Apertura', afectaCaja: true, total: this.caja.saldoApertura });
    for (const [k, v] of Object.entries(this.totalesFormasDePago)) {
      const fpAux = this.formasDePago.filter((fp: FormaDePago) => fp.idFormaDePago === Number(k));
      if (fpAux.length) {
        this.resumen.push({
          idFormaDePago: fpAux[0].idFormaDePago, nombreFormaDePago: fpAux[0].nombre, afectaCaja: fpAux[0].afectaCaja, total: v
        });
      }
    }
  }

  volverAlListado() {
    this.location.back();
  }

  panelBeforeChange($event) {
    if ($event.panelId === 'panel-0') {
      $event.preventDefault();
    }
  }

  cerrarCaja() {
    if (this.caja.estado !== EstadoCaja.ABIERTA) {
      return;
    }

    this.loadingOverlayService.activate();
    this.cajasService.getSaldoSistema(this.caja.idCaja)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: saldo => {
          const modalRef = this.modalService.open(MontoModalComponent, { scrollable: true });
          modalRef.componentInstance.title = 'Cerrar Caja';
          modalRef.componentInstance.htmlInfo = [
            '<em>El Saldo Sistema es:</em>', '&nbsp;', '<strong>' + formatCurrency(saldo, 'es-AR', '$') + '</strong>'
          ].join('');
          modalRef.componentInstance.label = 'Ingrese el Saldo Real:';
          modalRef.result.then((monto: number) => {
            this.loadingOverlayService.activate();
            this.cajasService.cerrarCaja(this.caja.idCaja, monto)
              .pipe(finalize(() => this.loadingOverlayService.deactivate()))
              .subscribe({
                next: caja => this.caja = caja,
                error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
              })
              ;
          }, () => { return; });
        },
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
      ;
  }

  nuevoGasto() {
    if (this.caja.estado !== EstadoCaja.ABIERTA) {
      return;
    }
    const modalRef = this.modalService.open(NuevoGastoModalComponent, { scrollable: true });
    modalRef.result.then(() => {
      const obs: Observable<any>[] = [
        this.cajasService.getCaja(this.caja.idCaja),
        this.cajasService.getTotalesFormasDePagoCaja(this.caja.idCaja)
      ];

      this.loadingOverlayService.activate();
      combineLatest(obs)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: data => {
            this.caja = data[0];
            this.totalesFormasDePago = data[1];
            this.refreshCaja();
          },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
        ;
    }, () => { return; });
  }

  reabrirCaja() {
    if (this.caja.estado !== EstadoCaja.CERRADA) {
      return;
    }

    const modalRef = this.modalService.open(MontoModalComponent, { scrollable: true });
    modalRef.componentInstance.title = 'Reabrir Caja';
    modalRef.componentInstance.label = 'Saldo Apertura';
    modalRef.result.then((monto: number) => {
      this.loadingOverlayService.activate();
      this.cajasService.reabrirCaja(this.caja.idCaja, monto)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: () => this.refreshCaja(),
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
        ;
    }, () => { return; });
  }

  eliminarCaja() {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('No posee permiso para eliminar una caja.', MensajeModalType.ERROR);
      return;
    }

    const msg = `¿Está seguro que desea eliminar la caja?`;
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.cajasService.eliminarCaja(this.caja.idCaja)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: () => this.volverAlListado(),
            error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
          })
          ;
      }
    }, () => { return; });
  }

  onMovimientosChange(cantidad: number) {
    if (cantidad > 0) {
      this.refreshTotales();
    } else {
      this.refreshCaja();
    }
  }
}
