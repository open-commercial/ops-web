import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Caja} from '../../models/caja';
import {CajasService} from '../../services/cajas.service';
import {finalize} from 'rxjs/operators';
import {MovimientoCaja} from '../../models/movimiento-caja';
import {MensajeService} from '../../services/mensaje.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {TipoDeComprobante} from '../../models/tipo-de-comprobante';
import {GastosService} from '../../services/gastos.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {RecibosService} from '../../services/recibos.service';
import {saveAs} from 'file-saver';
import {EstadoCaja} from '../../models/estado-caja';

@Component({
  selector: 'app-movimiento-caja',
  templateUrl: './movimiento-caja.component.html',
  styleUrls: ['./movimiento-caja.component.scss']
})
export class MovimientoCajaComponent implements OnInit {
  loading = false;
  movimientos: MovimientoCaja[] = [];

  private pCaja: Caja;
  @Input() set caja(value: Caja) { this.pCaja = value; }
  get caja(): Caja { return this.pCaja; }

  private pIdFormaDePago: number;
  @Input() set idFormaDePago(value: number) { this.pIdFormaDePago = value; }
  get idFormaDePago(): number { return this.pIdFormaDePago; }

  @Output() cantMovimientosChange = new EventEmitter<number>();

  estadoCaja = EstadoCaja;
  tipoComprobante = TipoDeComprobante;

  constructor(private cajasService: CajasService,
              private gastosService: GastosService,
              private recibosService: RecibosService,
              private mensajeService: MensajeService,
              private loadingOverlayService: LoadingOverlayService) { }

  ngOnInit() {
    this.loadingMovimientos(false);
  }

  loadingMovimientos(emitChange = true) {
    this.loading = true;
    this.cajasService.getMovimientosCaja(this.pCaja.idCaja, this.pIdFormaDePago)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        movimientos => {
          this.movimientos = movimientos;
          if (emitChange) {
            this.cantMovimientosChange.emit(this.movimientos.length);
          }
        },
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      )
    ;
  }

  eliminarGasto(m: MovimientoCaja) {
    if (m.tipoComprobante !== TipoDeComprobante.GASTO) {
      return;
    }

    const msg = `¿Está seguro que desea eliminar el gasto?`;
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.gastosService.eliminarGasto(m.idMovimiento)
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe(
            () => this.loadingMovimientos(),
            err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
          )
        ;
      }
    });
  }

  downloadReciboPdf(idRecibo: number) {
    this.loadingOverlayService.activate();
    this.recibosService.getReporteRecibo(idRecibo)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (res) => {
          const file = new Blob([res], {type: 'application/pdf'});
          saveAs(file, `Recibo.pdf`);
        },
        () => this.mensajeService.msg('Error al generar el reporte', MensajeModalType.ERROR),
      )
    ;
  }
}
