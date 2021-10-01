import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Caja} from '../../models/caja';
import {ActivatedRoute} from '@angular/router';
import {CajasService} from '../../services/cajas.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {formatCurrency, Location} from '@angular/common';
import {MensajeService} from '../../services/mensaje.service';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {EstadoCaja} from '../../models/estado-caja';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {FormasDePagoService} from '../../services/formas-de-pago.service';
import {FormaDePago} from '../../models/forma-de-pago';
import {NgbAccordion, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {MontoModalComponent} from '../monto-modal/monto-modal.component';
import {NuevoGastoModalComponent} from '../nuevo-gasto-modal/nuevo-gasto-modal.component';
import {SucursalesService} from '../../services/sucursales.service';

@Component({
  selector: 'app-ver-caja',
  templateUrl: './ver-caja.component.html'
})
export class VerCajaComponent implements OnInit, OnDestroy {
  estado = EstadoCaja;
  caja: Caja = null;
  formasDePago: FormaDePago[] = [];
  totalesFormasDePago: { [key: number]: number } = {};

  resumen: { idFormaDePago: number, nombreFormaDePago: string, afectaCaja: boolean, total: number}[] = [];

  totalQueAfectaCaja: number = null;
  totalSistema: number = null;
  loadingTotales = false;

  @ViewChild('accordion', {static: false}) accordion: NgbAccordion;

  subscription: Subscription;

  constructor(private route: ActivatedRoute,
              private formasDePagoService: FormasDePagoService,
              private cajasService: CajasService,
              private sucursalesService: SucursalesService,
              private location: Location,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private modalService: NgbModal) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.refreshCaja(id);

    this.subscription.add(this.sucursalesService.sucursal$.subscribe(() => this.volverAlListado()));
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
        .subscribe(
          (data: [Caja, FormaDePago[], { [key: number]: number }, number, number]) => {
            this.caja = data[0];
            this.formasDePago = data[1];
            this.totalesFormasDePago = data[2];
            this.totalQueAfectaCaja = data[3];
            this.totalSistema = data[4];
            this.generateResumen();
          },
          err => {
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            this.volverAlListado();
          }
        )
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
        .subscribe(
          (data: [number, number]) => {
            this.totalQueAfectaCaja = data[0];
            this.totalSistema = data[1];
          },
          err => {
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            this.volverAlListado();
          }
        )
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
      .subscribe(
        saldo => {
          const modalRef = this.modalService.open(MontoModalComponent, {scrollable: true});
          modalRef.componentInstance.title = 'Cerrar Caja';
          modalRef.componentInstance.htmlInfo = [
            '<em>El Saldo Sistema es:</em>', '&nbsp;', '<strong>' + formatCurrency(saldo, 'es-AR', '$') + '</strong>'
          ].join('');
          modalRef.componentInstance.label = 'Ingrese el Saldo Real:';
          modalRef.result.then((monto: number) => {
            this.loadingOverlayService.activate();
            this.cajasService.cerrarCaja(this.caja.idCaja, monto)
              .pipe(finalize(() => this.loadingOverlayService.deactivate()))
              .subscribe(
                caja => this.caja = caja,
                err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
              )
            ;
          }, () => { /* This is intentional */ });
        },
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      )
    ;
  }

  nuevoGasto() {
    if (this.caja.estado !== EstadoCaja.ABIERTA) {
      return;
    }
    const modalRef = this.modalService.open(NuevoGastoModalComponent, {scrollable: true});
    modalRef.result.then(() => {
      const obs: Observable<any>[] = [
        this.cajasService.getCaja(this.caja.idCaja),
        this.cajasService.getTotalesFormasDePagoCaja(this.caja.idCaja)
      ];

      this.loadingOverlayService.activate();
      combineLatest(obs)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          data => {
            this.caja = data[0];
            this.totalesFormasDePago = data[1];
            this.refreshCaja();
          },
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
        )
      ;
    }, () => { /* This is intentional */ });
  }


  onMovimientosChange(cantidad: number) {
    if (cantidad > 0) {
      this.refreshTotales();
    } else {
      this.refreshCaja();
    }
  }
}
